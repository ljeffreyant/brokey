import { strToU8, zipSync } from 'fflate';

/**
 * A small, dependency-light OOXML spreadsheet writer. It writes exactly what Brokey needs:
 * styled cells, formulas with cached values, merges, freeze panes, filters, data bars,
 * defined names and DrawingML charts. Parts are zipped with fflate, which runs on a phone.
 */

export function esc(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function colLetter(c: number): string {
  let n = c + 1;
  let s = '';
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export const ref = (r: number, c: number, abs = false) => (abs ? `$${colLetter(c)}$${r + 1}` : `${colLetter(c)}${r + 1}`);
export const range = (r0: number, c0: number, r1: number, c1: number, abs = false) => `${ref(r0, c0, abs)}:${ref(r1, c1, abs)}`;

/** Excel's date serial for a local wall-clock time. */
export function serial(ts: number): number {
  const d = new Date(ts);
  const local = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
  return local / 86400000 + 25569;
}

export function serialDay(ts: number): number {
  const d = new Date(ts);
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000 + 25569;
}

// ---------------------------------------------------------------- styles

export interface StyleSpec {
  bold?: boolean;
  italic?: boolean;
  size?: number;
  color?: string;
  font?: string;
  fill?: string;
  numFmt?: string;
  h?: 'left' | 'center' | 'right';
  v?: 'top' | 'center' | 'bottom';
  wrap?: boolean;
  indent?: number;
  border?: { color?: string; style?: 'thin' | 'medium' | 'thick' | 'hair' | 'dotted'; sides?: ('l' | 'r' | 't' | 'b')[] };
}

const BUILTIN_FMT: Record<string, number> = { General: 0, '0': 1, '0.00': 2, '#,##0': 3, '#,##0.00': 4, '0%': 9, '0.00%': 10 };

export class Styles {
  private fonts: string[] = [];
  private fills: string[] = [];
  private borders: string[] = [];
  private numFmts = new Map<string, number>();
  private xfs: { font: number; fill: number; border: number; numFmt: number; align: string }[] = [];
  private cache = new Map<string, number>();
  readonly dxfs: string[] = [];

  constructor(private defaultFont = 'Calibri', private defaultSize = 11, private defaultColor = '24120A') {
    this.fonts.push(this.fontXml({}));
    this.fills.push('<fill><patternFill patternType="none"/></fill>', '<fill><patternFill patternType="gray125"/></fill>');
    this.borders.push('<border><left/><right/><top/><bottom/><diagonal/></border>');
    this.xfs.push({ font: 0, fill: 0, border: 0, numFmt: 0, align: '' });
  }

  private fontXml(s: StyleSpec): string {
    return `<font>${s.bold ? '<b/>' : ''}${s.italic ? '<i/>' : ''}<sz val="${s.size ?? this.defaultSize}"/><color rgb="FF${(s.color ?? this.defaultColor).toUpperCase()}"/><name val="${esc(s.font ?? this.defaultFont)}"/><family val="2"/></font>`;
  }

  private idx(list: string[], xml: string): number {
    const i = list.indexOf(xml);
    if (i >= 0) return i;
    list.push(xml);
    return list.length - 1;
  }

  private fmtId(code?: string): number {
    if (!code) return 0;
    if (code in BUILTIN_FMT) return BUILTIN_FMT[code];
    let id = this.numFmts.get(code);
    if (id === undefined) {
      id = 164 + this.numFmts.size;
      this.numFmts.set(code, id);
    }
    return id;
  }

  /** Returns the cell format index for this look. Same look, same index. */
  get(s: StyleSpec | undefined): number {
    if (!s) return 0;
    const key = JSON.stringify(s);
    const hit = this.cache.get(key);
    if (hit !== undefined) return hit;
    const font = this.idx(this.fonts, this.fontXml(s));
    const fill = s.fill ? this.idx(this.fills, `<fill><patternFill patternType="solid"><fgColor rgb="FF${s.fill.toUpperCase()}"/><bgColor indexed="64"/></patternFill></fill>`) : 0;
    let border = 0;
    if (s.border) {
      const st = s.border.style ?? 'thin';
      const col = `<color rgb="FF${(s.border.color ?? '24120A').toUpperCase()}"/>`;
      const sides = s.border.sides ?? ['l', 'r', 't', 'b'];
      const side = (tag: string, k: 'l' | 'r' | 't' | 'b') => (sides.includes(k) ? `<${tag} style="${st}">${col}</${tag}>` : `<${tag}/>`);
      border = this.idx(this.borders, `<border>${side('left', 'l')}${side('right', 'r')}${side('top', 't')}${side('bottom', 'b')}<diagonal/></border>`);
    }
    const align = s.h || s.v || s.wrap || s.indent ? `<alignment${s.h ? ` horizontal="${s.h}"` : ''}${s.v ? ` vertical="${s.v}"` : ''}${s.wrap ? ' wrapText="1"' : ''}${s.indent ? ` indent="${s.indent}"` : ''}/>` : '';
    this.xfs.push({ font, fill, border, numFmt: this.fmtId(s.numFmt), align });
    const id = this.xfs.length - 1;
    this.cache.set(key, id);
    return id;
  }

  /** A differential format for conditional formatting. */
  dxf(s: { color?: string; fill?: string; bold?: boolean }): number {
    const xml = `<dxf>${s.color || s.bold ? `<font>${s.bold ? '<b/>' : ''}${s.color ? `<color rgb="FF${s.color}"/>` : ''}</font>` : ''}${s.fill ? `<fill><patternFill><bgColor rgb="FF${s.fill}"/></patternFill></fill>` : ''}</dxf>`;
    const i = this.dxfs.indexOf(xml);
    if (i >= 0) return i;
    this.dxfs.push(xml);
    return this.dxfs.length - 1;
  }

  xml(): string {
    const fmts = [...this.numFmts.entries()].map(([code, id]) => `<numFmt numFmtId="${id}" formatCode="${esc(code)}"/>`).join('');
    const xfs = this.xfs
      .map((x) => `<xf numFmtId="${x.numFmt}" fontId="${x.font}" fillId="${x.fill}" borderId="${x.border}" xfId="0"${x.numFmt ? ' applyNumberFormat="1"' : ''}${x.font ? ' applyFont="1"' : ''}${x.fill ? ' applyFill="1"' : ''}${x.border ? ' applyBorder="1"' : ''}${x.align ? ' applyAlignment="1">' + x.align + '</xf>' : '/>'}`)
      .join('');
    return (
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      (fmts ? `<numFmts count="${this.numFmts.size}">${fmts}</numFmts>` : '') +
      `<fonts count="${this.fonts.length}">${this.fonts.join('')}</fonts>` +
      `<fills count="${this.fills.length}">${this.fills.join('')}</fills>` +
      `<borders count="${this.borders.length}">${this.borders.join('')}</borders>` +
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
      `<cellXfs count="${this.xfs.length}">${xfs}</cellXfs>` +
      '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
      `<dxfs count="${this.dxfs.length}">${this.dxfs.join('')}</dxfs>` +
      '<tableStyles count="0" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleLight16"/>' +
      '</styleSheet>'
    );
  }
}

// ---------------------------------------------------------------- charts

export interface ChartSeries {
  name: string;
  /** e.g. Summary!$B$12:$B$16 */
  valuesRef: string;
  catsRef: string;
  values: number[];
  cats: (string | number)[];
  /** when the category cells are numbers (dates), the format code to show them with */
  catsFormat?: string;
  /** hex colours per point (pie) or one colour for the whole series (bar) */
  colors?: string[];
  numFmt?: string;
}

export interface ChartSpec {
  kind: 'pie' | 'column' | 'bar';
  title: string;
  series: ChartSeries[];
  /** anchor in cell coordinates: from col,row to col,row (0-based, exclusive end) */
  anchor: { c0: number; r0: number; c1: number; r1: number; /** left padding in EMU */ pad?: number };
  legend?: boolean;
  /** axis titles for column/bar */
  valTitle?: string;
  ink?: string;
}

function strCache(vals: string[]): string {
  return `<c:strCache><c:ptCount val="${vals.length}"/>${vals.map((v, i) => `<c:pt idx="${i}"><c:v>${esc(v)}</c:v></c:pt>`).join('')}</c:strCache>`;
}
function numCache(vals: number[], fmt = 'General'): string {
  return `<c:numCache><c:formatCode>${esc(fmt)}</c:formatCode><c:ptCount val="${vals.length}"/>${vals.map((v, i) => `<c:pt idx="${i}"><c:v>${v}</c:v></c:pt>`).join('')}</c:numCache>`;
}

const sp = (fill: string, line?: string, w = 19050) => `<c:spPr><a:solidFill><a:srgbClr val="${fill}"/></a:solidFill>${line ? `<a:ln w="${w}"><a:solidFill><a:srgbClr val="${line}"/></a:solidFill></a:ln>` : ''}</c:spPr>`;

function txPr(sz: number, color: string, bold = false): string {
  return `<c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="${sz}" b="${bold ? 1 : 0}"><a:solidFill><a:srgbClr val="${color}"/></a:solidFill></a:defRPr></a:pPr><a:endParaRPr lang="en-US"/></a:p></c:txPr>`;
}

function titleXml(text: string, ink: string): string {
  return `<c:title><c:tx><c:rich><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="1400" b="1"><a:solidFill><a:srgbClr val="${ink}"/></a:solidFill></a:defRPr></a:pPr><a:r><a:rPr lang="en-US" sz="1400" b="1"><a:solidFill><a:srgbClr val="${ink}"/></a:solidFill></a:rPr><a:t>${esc(text)}</a:t></a:r></a:p></c:rich></c:tx><c:overlay val="0"/></c:title>`;
}

export function chartXml(c: ChartSpec): string {
  const ink = c.ink ?? '24120A';
  const ser = c.series
    .map((s, i) => {
      const tx = `<c:tx><c:v>${esc(s.name)}</c:v></c:tx>`;
      const cat = s.catsFormat
        ? `<c:cat><c:numRef><c:f>${esc(s.catsRef)}</c:f>${numCache(s.cats as number[], s.catsFormat)}</c:numRef></c:cat>`
        : `<c:cat><c:strRef><c:f>${esc(s.catsRef)}</c:f>${strCache(s.cats.map(String))}</c:strRef></c:cat>`;
      const val = `<c:val><c:numRef><c:f>${esc(s.valuesRef)}</c:f>${numCache(s.values, s.numFmt)}</c:numRef></c:val>`;
      if (c.kind === 'pie') {
        const dpts = (s.colors ?? []).map((col, k) => `<c:dPt><c:idx val="${k}"/><c:bubble3D val="0"/>${sp(col, ink, 25400)}</c:dPt>`).join('');
        const lbls = `<c:dLbls><c:spPr><a:noFill/><a:ln><a:noFill/></a:ln></c:spPr>${txPr(1000, ink, true)}<c:showLegendKey val="0"/><c:showVal val="0"/><c:showCatName val="0"/><c:showSerName val="0"/><c:showPercent val="1"/><c:showBubbleSize val="0"/><c:showLeaderLines val="0"/></c:dLbls>`;
        return `<c:ser><c:idx val="${i}"/><c:order val="${i}"/>${tx}${dpts}${lbls}${cat}${val}</c:ser>`;
      }
      const col = s.colors?.[0] ?? 'FFD23F';
      return `<c:ser><c:idx val="${i}"/><c:order val="${i}"/>${tx}${sp(col, ink, 12700)}<c:invertIfNegative val="0"/>${cat}${val}</c:ser>`;
    })
    .join('');

  let plot: string;
  if (c.kind === 'pie') {
    plot = `<c:pieChart><c:varyColors val="1"/>${ser}<c:firstSliceAng val="0"/></c:pieChart>`;
  } else {
    const horizontal = c.kind === 'bar';
    const catFmt = c.series[0]?.catsFormat ?? 'General';
    plot =
      `<c:barChart><c:barDir val="${horizontal ? 'bar' : 'col'}"/><c:grouping val="clustered"/><c:varyColors val="0"/>${ser}<c:gapWidth val="40"/><c:axId val="111111111"/><c:axId val="222222222"/></c:barChart>` +
      `<c:catAx><c:axId val="111111111"/><c:scaling><c:orientation val="${horizontal ? 'maxMin' : 'minMax'}"/></c:scaling><c:delete val="0"/><c:axPos val="${horizontal ? 'l' : 'b'}"/><c:numFmt formatCode="${esc(catFmt)}" sourceLinked="0"/><c:majorTickMark val="none"/><c:minorTickMark val="none"/><c:tickLblPos val="nextTo"/><c:spPr><a:ln w="19050"><a:solidFill><a:srgbClr val="${ink}"/></a:solidFill></a:ln></c:spPr>${txPr(900, ink)}<c:crossAx val="222222222"/><c:crosses val="autoZero"/><c:auto val="${c.series[0]?.catsFormat ? 0 : 1}"/><c:lblAlgn val="ctr"/><c:lblOffset val="100"/><c:noMultiLvlLbl val="0"/></c:catAx>` +
      `<c:valAx><c:axId val="222222222"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="0"/><c:axPos val="${horizontal ? 't' : 'l'}"/><c:majorGridlines><c:spPr><a:ln w="6350"><a:solidFill><a:srgbClr val="E6D5B5"/></a:solidFill></a:ln></c:spPr></c:majorGridlines>${c.valTitle ? titleXml(c.valTitle, ink).replace('sz="1400"', 'sz="900"').replace('sz="1400"', 'sz="900"') : ''}<c:numFmt formatCode="General" sourceLinked="1"/><c:majorTickMark val="none"/><c:minorTickMark val="none"/><c:tickLblPos val="nextTo"/><c:spPr><a:ln><a:noFill/></a:ln></c:spPr>${txPr(900, ink)}<c:crossAx val="111111111"/><c:crosses val="${horizontal ? 'max' : 'autoZero'}"/><c:crossBetween val="between"/></c:valAx>`;
  }

  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    '<c:roundedCorners val="0"/>' +
    `<c:chart>${titleXml(c.title, ink)}<c:autoTitleDeleted val="0"/><c:plotArea><c:layout/>${plot}<c:spPr><a:noFill/></c:spPr></c:plotArea>` +
    (c.legend ? `<c:legend><c:legendPos val="r"/><c:overlay val="0"/>${txPr(1000, ink)}</c:legend>` : '') +
    '<c:plotVisOnly val="1"/><c:dispBlanksAs val="gap"/></c:chart>' +
    '<c:spPr><a:solidFill><a:srgbClr val="FFFDF6"/></a:solidFill><a:ln w="28575"><a:solidFill><a:srgbClr val="' + ink + '"/></a:solidFill></a:ln></c:spPr>' +
    '</c:chartSpace>'
  );
}

// ---------------------------------------------------------------- sheets

export type CellInput = string | number | boolean | null | undefined;

interface Cell {
  v?: string | number | boolean;
  f?: string;
  s: number;
  /** text result of a formula */
  str?: boolean;
}

export class Sheet {
  readonly cells = new Map<number, Map<number, Cell>>();
  readonly widths = new Map<number, number>();
  readonly heights = new Map<number, number>();
  readonly merges: string[] = [];
  readonly cond: string[] = [];
  readonly charts: ChartSpec[] = [];
  freeze: { rows: number; cols: number } | null = null;
  filter: string | null = null;
  tab?: string;
  grid = false;
  landscape = false;
  zoom = 100;

  constructor(readonly name: string, private styles: Styles) {}

  private put(r: number, c: number, cell: Cell): void {
    let row = this.cells.get(r);
    if (!row) this.cells.set(r, (row = new Map()));
    row.set(c, cell);
  }

  /** A value: text, number, or nothing. Style is a look from the style registry. */
  set(r: number, c: number, v: CellInput, style?: StyleSpec): this {
    const s = this.styles.get(style);
    if (v === null || v === undefined || v === '') this.put(r, c, { s });
    else this.put(r, c, { v, s });
    return this;
  }

  /** A live formula plus the value it should show until a spreadsheet recalculates it. */
  formula(r: number, c: number, f: string, cached: number | string, style?: StyleSpec): this {
    this.put(r, c, { f, v: cached, s: this.styles.get(style), str: typeof cached === 'string' });
    return this;
  }

  blank(r: number, c: number, style?: StyleSpec): this {
    this.put(r, c, { s: this.styles.get(style) });
    return this;
  }

  fillRow(r: number, c0: number, c1: number, style: StyleSpec): this {
    for (let c = c0; c <= c1; c++) if (!this.cells.get(r)?.has(c)) this.blank(r, c, style);
    return this;
  }

  merge(r0: number, c0: number, r1: number, c1: number): this {
    this.merges.push(range(r0, c0, r1, c1));
    return this;
  }

  width(c: number, w: number): this {
    this.widths.set(c, w);
    return this;
  }

  height(r: number, h: number): this {
    this.heights.set(r, h);
    return this;
  }

  dataBar(rng: string, color: string): this {
    this.cond.push(`<conditionalFormatting sqref="${rng}"><cfRule type="dataBar" priority="${this.cond.length + 1}"><dataBar><cfvo type="num" val="0"/><cfvo type="max"/><color rgb="FF${color}"/></dataBar></cfRule></conditionalFormatting>`);
    return this;
  }

  /** Style cells where the formula is true. The formula is relative to the first cell in the range. */
  when(rng: string, formula: string, dxf: number): this {
    this.cond.push(`<conditionalFormatting sqref="${rng}"><cfRule type="expression" dxfId="${dxf}" priority="${this.cond.length + 1}"><formula>${esc(formula)}</formula></cfRule></conditionalFormatting>`);
    return this;
  }

  addChart(c: ChartSpec): this {
    this.charts.push(c);
    return this;
  }

  dimension(): string {
    let maxR = 0;
    let maxC = 0;
    for (const [r, row] of this.cells) for (const c of row.keys()) {
      maxR = Math.max(maxR, r);
      maxC = Math.max(maxC, c);
    }
    return `A1:${ref(maxR, maxC)}`;
  }

  xml(sst: Shared, selected: boolean, hasDrawing: boolean, omitCached = false): string {
    const rows = [...this.cells.keys()].sort((a, b) => a - b);
    const sheetData = rows
      .map((r) => {
        const row = this.cells.get(r) as Map<number, Cell>;
        const ht = this.heights.get(r);
        const cs = [...row.keys()]
          .sort((a, b) => a - b)
          .map((c) => {
            const cell = row.get(c) as Cell;
            const a = ref(r, c);
            const s = cell.s ? ` s="${cell.s}"` : '';
            if (cell.f !== undefined) {
              const f = `<f>${esc(cell.f)}</f>`;
              if (omitCached) return `<c r="${a}"${s}>${f}</c>`;
              if (cell.str) return `<c r="${a}"${s} t="str">${f}<v>${esc(String(cell.v))}</v></c>`;
              return `<c r="${a}"${s}>${f}<v>${Number.isFinite(cell.v as number) ? cell.v : 0}</v></c>`;
            }
            if (cell.v === undefined) return `<c r="${a}"${s}/>`;
            if (typeof cell.v === 'number') return `<c r="${a}"${s}><v>${Number.isFinite(cell.v) ? cell.v : 0}</v></c>`;
            if (typeof cell.v === 'boolean') return `<c r="${a}"${s} t="b"><v>${cell.v ? 1 : 0}</v></c>`;
            return `<c r="${a}"${s} t="s"><v>${sst.id(cell.v)}</v></c>`;
          })
          .join('');
        return `<row r="${r + 1}"${ht ? ` ht="${ht}" customHeight="1"` : ''}>${cs}</row>`;
      })
      .join('');

    const cols = [...this.widths.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([c, w]) => `<col min="${c + 1}" max="${c + 1}" width="${w}" customWidth="1"/>`)
      .join('');

    let pane = '';
    if (this.freeze) {
      const { rows: fr, cols: fc } = this.freeze;
      const tl = ref(fr, fc);
      const active = fr > 0 && fc > 0 ? 'bottomRight' : fr > 0 ? 'bottomLeft' : 'topRight';
      pane = `<pane${fc ? ` xSplit="${fc}"` : ''}${fr ? ` ySplit="${fr}"` : ''} topLeftCell="${tl}" activePane="${active}" state="frozen"/><selection pane="${active}"/>`;
    }

    return (
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      `<sheetPr>${this.tab ? `<tabColor rgb="FF${this.tab}"/>` : ''}<pageSetUpPr fitToPage="1"/></sheetPr>` +
      `<dimension ref="${this.dimension()}"/>` +
      `<sheetViews><sheetView${this.grid ? '' : ' showGridLines="0"'}${selected ? ' tabSelected="1"' : ''}${this.zoom !== 100 ? ` zoomScale="${this.zoom}" zoomScaleNormal="${this.zoom}"` : ''} workbookViewId="0">${pane}</sheetView></sheetViews>` +
      '<sheetFormatPr defaultRowHeight="15"/>' +
      (cols ? `<cols>${cols}</cols>` : '') +
      `<sheetData>${sheetData}</sheetData>` +
      (this.filter ? `<autoFilter ref="${this.filter}"/>` : '') +
      (this.merges.length ? `<mergeCells count="${this.merges.length}">${this.merges.map((m) => `<mergeCell ref="${m}"/>`).join('')}</mergeCells>` : '') +
      this.cond.join('') +
      '<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/>' +
      `<pageSetup orientation="${this.landscape ? 'landscape' : 'portrait'}" fitToWidth="1" fitToHeight="0"/>` +
      (hasDrawing ? '<drawing r:id="rId1"/>' : '') +
      '</worksheet>'
    );
  }
}

class Shared {
  private map = new Map<string, number>();
  private list: string[] = [];
  count = 0;
  id(s: string | number | boolean): number {
    const k = String(s);
    this.count++;
    let i = this.map.get(k);
    if (i === undefined) {
      i = this.list.length;
      this.list.push(k);
      this.map.set(k, i);
    }
    return i;
  }
  xml(): string {
    return (
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${this.count}" uniqueCount="${this.list.length}">` +
      this.list.map((s) => `<si><t xml:space="preserve">${esc(s)}</t></si>`).join('') +
      '</sst>'
    );
  }
}

// ---------------------------------------------------------------- workbook

export class Workbook {
  readonly styles: Styles;
  readonly sheets: Sheet[] = [];
  readonly names: { name: string; ref: string }[] = [];
  title = 'Workbook';
  creator = 'Brokey';
  /** test hook: leave formula results out so a spreadsheet app has to calculate them itself */
  omitCached = false;

  constructor(font = 'Calibri', size = 11) {
    this.styles = new Styles(font, size);
  }

  sheet(name: string): Sheet {
    const s = new Sheet(name.slice(0, 31), this.styles);
    this.sheets.push(s);
    return s;
  }

  defineName(name: string, refStr: string): void {
    this.names.push({ name, ref: refStr });
  }

  build(): Uint8Array {
    const sst = new Shared();
    const files: Record<string, Uint8Array> = {};
    const put = (path: string, xml: string) => {
      files[path] = strToU8(xml);
    };

    const overrides: string[] = [];
    let chartNo = 0;
    let drawingNo = 0;

    // sheets (and their drawings) first, so shared strings are complete before sharedStrings.xml is written
    this.sheets.forEach((sh, i) => {
      const n = i + 1;
      const hasDrawing = sh.charts.length > 0;
      put(`xl/worksheets/sheet${n}.xml`, sh.xml(sst, i === 0, hasDrawing, this.omitCached));
      overrides.push(`<Override PartName="/xl/worksheets/sheet${n}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`);
      if (hasDrawing) {
        drawingNo++;
        const anchors: string[] = [];
        const drels: string[] = [];
        sh.charts.forEach((ch, k) => {
          chartNo++;
          put(`xl/charts/chart${chartNo}.xml`, chartXml(ch));
          overrides.push(`<Override PartName="/xl/charts/chart${chartNo}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>`);
          drels.push(`<Relationship Id="rId${k + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart${chartNo}.xml"/>`);
          const a = ch.anchor;
          anchors.push(
            `<xdr:twoCellAnchor><xdr:from><xdr:col>${a.c0}</xdr:col><xdr:colOff>${a.pad ?? 0}</xdr:colOff><xdr:row>${a.r0}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from><xdr:to><xdr:col>${a.c1}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${a.r1}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>` +
              `<xdr:graphicFrame macro=""><xdr:nvGraphicFramePr><xdr:cNvPr id="${k + 2}" name="Chart ${k + 1}"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr><xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm>` +
              `<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart"><c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="rId${k + 1}"/></a:graphicData></a:graphic></xdr:graphicFrame><xdr:clientData/></xdr:twoCellAnchor>`,
          );
        });
        put(`xl/drawings/drawing${drawingNo}.xml`, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">${anchors.join('')}</xdr:wsDr>`);
        put(`xl/drawings/_rels/drawing${drawingNo}.xml.rels`, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${drels.join('')}</Relationships>`);
        overrides.push(`<Override PartName="/xl/drawings/drawing${drawingNo}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>`);
        put(`xl/worksheets/_rels/sheet${n}.xml.rels`, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing${drawingNo}.xml"/></Relationships>`);
      }
    });

    put('xl/styles.xml', this.styles.xml());
    put('xl/sharedStrings.xml', sst.xml());

    const names = this.names.map((n) => `<definedName name="${esc(n.name)}">${esc(n.ref)}</definedName>`).join('');
    put(
      'xl/workbook.xml',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
        '<workbookPr/><bookViews><workbookView activeTab="0"/></bookViews>' +
        `<sheets>${this.sheets.map((s, i) => `<sheet name="${esc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets>` +
        (names ? `<definedNames>${names}</definedNames>` : '') +
        '<calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>',
    );
    const n = this.sheets.length;
    put(
      'xl/_rels/workbook.xml.rels',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        this.sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('') +
        `<Relationship Id="rId${n + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
        `<Relationship Id="rId${n + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>` +
        '</Relationships>',
    );
    put(
      'docProps/core.xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${esc(this.title)}</dc:title><dc:creator>${esc(this.creator)}</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</dcterms:created></cp:coreProperties>`,
    );
    put('docProps/app.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>${esc(this.creator)}</Application></Properties>`);
    put('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>');
    put(
      '[Content_Types].xml',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
        '<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>' +
        '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
        '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>' +
        overrides.join('') +
        '</Types>',
    );

    // [Content_Types].xml first, as the format expects.
    const ordered: Record<string, Uint8Array> = { '[Content_Types].xml': files['[Content_Types].xml'] };
    for (const k of Object.keys(files)) if (k !== '[Content_Types].xml') ordered[k] = files[k];
    return zipSync(ordered, { level: 6 });
  }
}
