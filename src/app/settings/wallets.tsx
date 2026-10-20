import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Freq, IncomeItem, RecurringItem, Wallet, computeOverview, toWeeklyCents, uid, weeklyPoolCents } from '../../core';
import { useT } from '../../i18n';
import { WALLET_COLORS, useStore } from '../../store';
import { useTheme } from '../../theme';
import { AmountField } from '../../ui/AmountField';
import { IconDisc } from '../../ui/CatIcon';
import { Glyph } from '../../ui/Glyph';
import { Page } from '../../ui/Page';
import { Sheet } from '../../ui/Sheet';
import { Txt } from '../../ui/Txt';
import { Btn, Card, Chip, Field, RoundBtn, SectionTitle, Segmented } from '../../ui/kit';
import { haptic } from '../../ui/haptics';
import { useFmt, useNow } from '../../ui/useFmt';
import { currencyDef } from '../../core';

const ICONS = ['hsp', 'wallet', 'piggy', 'coin', 'bank', 'plane', 'palm', 'suitcase', 'gift', 'tee', 'phone', 'coffee', 'groceries', 'dice'];
const FREQS: Freq[] = ['weekly', 'fortnightly', 'monthly', 'yearly'];

type Draft = Pick<Wallet, 'name' | 'icon' | 'color' | 'budgetMode' | 'manualWeeklyCents' | 'income' | 'recurring' | 'savingsWeeklyCents'>;

const blank = (): Draft => ({ name: '', icon: 'hsp', color: WALLET_COLORS[0], budgetMode: 'manual', manualWeeklyCents: 10000, income: [], recurring: [], savingsWeeklyCents: 0 });

type Item = IncomeItem | RecurringItem;

function ItemEditor({ items, onChange, addLabel, symbol }: { items: Item[]; onChange: (l: Item[]) => void; addLabel: string; symbol: string }) {
  const p = useTheme();
  const t = useT();
  const set = (id: string, patch: Partial<Item>) => onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  return (
    <View style={{ gap: 10 }}>
      {items.map((it) => (
        <View key={it.id} style={{ backgroundColor: p.card2, borderRadius: 18, padding: 10, gap: 8 }}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Field value={it.label} onChangeText={(v) => set(it.id, { label: v })} placeholder={t('wallets.itemPh')} style={{ flex: 1, minHeight: 46 }} maxLength={30} />
            <RoundBtn glyph="trash" label={t('common.delete')} size={40} onPress={() => onChange(items.filter((i) => i.id !== it.id))} />
          </View>
          <AmountField label={t('wallets.itemPh')} cents={it.amountCents} onChange={(c) => set(it.id, { amountCents: c ?? 0 })} symbol={symbol} placeholder="0" style={{ minHeight: 46 }} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {FREQS.map((fr) => (
              <Chip key={fr} small label={t(`wallets.freq.${fr}` as never)} on={it.freq === fr} onPress={() => set(it.id, { freq: fr })} />
            ))}
          </View>
        </View>
      ))}
      <Btn label={addLabel} glyph="plus" tone="card" size="sm" onPress={() => onChange([...items, { id: uid(), label: '', amountCents: 0, freq: 'weekly' }])} />
    </View>
  );
}

export default function WalletsScreen() {
  const p = useTheme();
  const t = useT();
  const f = useFmt();
  const now = useNow(60000);
  const wallets = useStore((s) => s.wallets);
  const settings = useStore((s) => s.settings);
  const purchases = useStore((s) => s.purchases);
  const addWallet = useStore((s) => s.addWallet);
  const updateWallet = useStore((s) => s.updateWallet);
  const archiveWallet = useStore((s) => s.archiveWallet);
  const deleteWallet = useStore((s) => s.deleteWallet);
  const setActive = useStore((s) => s.setActiveWallet);
  const [editing, setEditing] = useState<{ id: string | null; draft: Draft } | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const symbol = currencyDef(settings.currency).symbol;

  const overview = useMemo(() => computeOverview(wallets, settings, purchases, now), [wallets, settings, purchases, now]);
  const live = wallets.filter((w) => !w.archived);
  const archived = wallets.filter((w) => w.archived);

  const open = (w?: Wallet) =>
    setEditing(
      w
        ? { id: w.id, draft: { name: w.name, icon: w.icon, color: w.color, budgetMode: w.budgetMode, manualWeeklyCents: w.manualWeeklyCents, income: w.income, recurring: w.recurring, savingsWeeklyCents: w.savingsWeeklyCents } }
        : { id: null, draft: blank() },
    );

  const set = (patch: Partial<Draft>) => setEditing((e) => (e ? { ...e, draft: { ...e.draft, ...patch } } : e));
  const d = editing?.draft;
  const pool = d ? weeklyPoolCents(d) : 0;
  const canSave = !!d && d.name.trim().length > 0;

  const save = () => {
    if (!editing || !d) return;
    haptic.good();
    const patch = { ...d, name: d.name.trim() };
    if (editing.id) updateWallet(editing.id, patch);
    else addWallet(patch);
    setEditing(null);
  };

  const row = (w: Wallet, budget?: { spent: number; pool: number }) => (
    <Pressable
      key={w.id}
      accessibilityRole="button"
      accessibilityLabel={w.name}
      onPress={() => {
        haptic.tap();
        open(w);
      }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14 }}
    >
      <IconDisc id={w.icon} size={50} color={w.color} ring />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Txt v="bodyBold" numberOfLines={1} style={{ flexShrink: 1 }}>
            {w.name}
          </Txt>
          {settings.activeWalletId === w.id ? (
            <View style={{ backgroundColor: p.accent2, borderRadius: 8, borderWidth: 1.5, borderColor: p.ink, paddingHorizontal: 6, paddingVertical: 1 }}>
              <Txt v="label" size={9} color={p.onAccent2}>
                {t('wallets.active')}
              </Txt>
            </View>
          ) : null}
        </View>
        <Txt v="small" dim>
          {t('wallets.perWeek', { amount: f.hsp(weeklyPoolCents(w)) })}
        </Txt>
        {budget ? (
          <Txt v="small" faint>
            {t('wallets.spentWeek', { amount: f.hsp(budget.spent) })}
          </Txt>
        ) : null}
      </View>
      <Glyph name="right" size={18} color={p.textFaint} />
    </Pressable>
  );

  return (
    <Page title={t('wallets.title')} sub={t('wallets.sub')} right={<RoundBtn glyph="plus" label={t('wallets.add')} fill={p.accent2} color={p.onAccent2} onPress={() => open()} />}>
      {live.length > 1 ? (
        <Card weight="quiet" fill={p.accent} inner={{ paddingVertical: 12 }}>
          <Txt v="label" color={p.onAccent} style={{ opacity: 0.85 }}>
            {t('wallets.total')}
          </Txt>
          <Txt v="display" color={p.onAccent}>
            {f.hsp(overview.total.spentWeekCents)}
          </Txt>
          <Txt v="small" color={p.onAccent} style={{ fontFamily: 'DMSans_700Bold' }}>
            {t('wallets.perWeek', { amount: f.hsp(overview.total.budgetCents) })}
          </Txt>
        </Card>
      ) : null}

      <Card weight="quiet" inner={{ padding: 0 }}>
        {overview.wallets.map((x, i) => (
          <View key={x.wallet.id}>
            {i > 0 ? <View style={{ height: 1.5, backgroundColor: p.line, marginLeft: 14 }} /> : null}
            {row(x.wallet, { spent: x.budget.spentWeekCents, pool: x.budget.budgetCents })}
          </View>
        ))}
      </Card>

      {archived.length > 0 ? (
        <>
          <SectionTitle>{t('wallets.archived')}</SectionTitle>
          <Card weight="quiet" inner={{ padding: 0 }}>
            {archived.map((w, i) => (
              <View key={w.id} style={{ opacity: 0.6 }}>
                {i > 0 ? <View style={{ height: 1.5, backgroundColor: p.line, marginLeft: 14 }} /> : null}
                {row(w)}
              </View>
            ))}
          </Card>
        </>
      ) : null}

      <Sheet visible={!!editing} onClose={() => setEditing(null)} title={editing?.id ? t('wallets.edit') : t('wallets.add')} maxH={0.92}>
        {d ? (
          <View style={{ gap: 16, paddingBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <IconDisc id={d.icon} size={64} color={d.color} ring />
              <Field value={d.name} onChangeText={(v) => set({ name: v })} placeholder={t('wallets.namePh')} maxLength={24} style={{ flex: 1 }} />
            </View>

            <View style={{ gap: 8 }}>
              <Txt v="label" dim>
                {t('wallets.icon')}
              </Txt>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {ICONS.map((id) => (
                  <Pressable
                    key={id}
                    accessibilityRole="button"
                    accessibilityLabel={id}
                    accessibilityState={{ selected: d.icon === id }}
                    onPress={() => {
                      haptic.tap();
                      set({ icon: id });
                    }}
                    style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: d.icon === id ? p.accent2 : p.card, borderWidth: 2.2, borderColor: p.ink, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <IconDisc id={id} size={40} color="transparent" />
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={{ gap: 8 }}>
              <Txt v="label" dim>
                {t('wallets.color')}
              </Txt>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {WALLET_COLORS.map((c) => (
                  <Pressable
                    key={c}
                    accessibilityRole="button"
                    accessibilityLabel={c}
                    accessibilityState={{ selected: d.color === c }}
                    onPress={() => {
                      haptic.tap();
                      set({ color: c });
                    }}
                    style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: c, borderWidth: d.color === c ? 4 : 2.5, borderColor: p.ink, alignItems: 'center', justifyContent: 'center' }}
                  >
                    {d.color === c ? <Glyph name="check" size={16} color="#24120A" stroke={3.2} /> : null}
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={{ gap: 8 }}>
              <Txt v="label" dim>
                {t('wallets.mode')}
              </Txt>
              <Segmented
                value={d.budgetMode}
                options={[
                  { id: 'manual', label: t('wallets.manual') },
                  { id: 'auto', label: t('wallets.auto') },
                ]}
                onChange={(v) => set({ budgetMode: v })}
              />
            </View>

            {d.budgetMode === 'manual' ? (
              <View style={{ gap: 8 }}>
                <Txt v="label" dim>
                  {t('wallets.weeklyBudget')}
                </Txt>
                <AmountField label={t('wallets.weeklyBudget')} cents={d.manualWeeklyCents} onChange={(c) => set({ manualWeeklyCents: c ?? 0 })} symbol={symbol} placeholder="0" />
              </View>
            ) : (
              <View style={{ gap: 14 }}>
                <View style={{ gap: 8 }}>
                  <Txt v="label" dim>
                    {t('wallets.income')}
                  </Txt>
                  <ItemEditor items={d.income} onChange={(l) => set({ income: l as IncomeItem[] })} addLabel={t('wallets.addIncome')} symbol={symbol} />
                </View>
                <View style={{ gap: 8 }}>
                  <Txt v="label" dim>
                    {t('wallets.recurring')}
                  </Txt>
                  <ItemEditor items={d.recurring} onChange={(l) => set({ recurring: l as RecurringItem[] })} addLabel={t('wallets.addBill')} symbol={symbol} />
                </View>
                <View style={{ gap: 8 }}>
                  <Txt v="label" dim>
                    {t('wallets.savings')}
                  </Txt>
                  <AmountField label={t('wallets.savings')} cents={d.savingsWeeklyCents} onChange={(c) => set({ savingsWeeklyCents: c ?? 0 })} symbol={symbol} placeholder="0" />
                </View>
              </View>
            )}

            <Card weight="quiet" fill={p.card2} depth={0} inner={{ padding: 12 }}>
              <Txt v="bodyBold">{t('wallets.pool', { amount: `${f.sum(pool)} (${f.hsp(pool)})` })}</Txt>
            </Card>

            <Btn label={t('wallets.save')} full glyph="check" disabled={!canSave} onPress={save} />

            {editing?.id ? (
              <View style={{ gap: 10 }}>
                <Btn
                  label={t('wallets.active')}
                  tone="card"
                  full
                  glyph="eye"
                  onPress={() => {
                    setActive(editing.id as string);
                    setEditing(null);
                  }}
                />
                <Btn
                  label={wallets.find((w) => w.id === editing.id)?.archived ? t('wallets.unarchive') : t('wallets.archive')}
                  tone="card"
                  full
                  disabled={!wallets.find((w) => w.id === editing.id)?.archived && live.length <= 1}
                  onPress={() => {
                    archiveWallet(editing.id as string, !wallets.find((w) => w.id === editing.id)?.archived);
                    setEditing(null);
                  }}
                />
                <Btn label={t('wallets.delete')} tone="danger" full glyph="trash" disabled={wallets.length <= 1} onPress={() => setConfirmDel(true)} />
                {live.length <= 1 ? (
                  <Txt v="small" faint align="center">
                    {t('wallets.keepOne')}
                  </Txt>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}
      </Sheet>

      <Sheet visible={confirmDel} onClose={() => setConfirmDel(false)} title={t('wallets.deleteTitle')}>
        <View style={{ gap: 14, paddingBottom: 8 }}>
          <Txt v="body" dim>
            {t('wallets.deleteBody')}
          </Txt>
          <Btn
            label={t('wallets.deleteYes')}
            tone="danger"
            glyph="trash"
            full
            onPress={() => {
              haptic.warn();
              if (editing?.id) deleteWallet(editing.id);
              setConfirmDel(false);
              setEditing(null);
            }}
          />
          <Btn label={t('common.cancel')} tone="card" full onPress={() => setConfirmDel(false)} />
        </View>
      </Sheet>
    </Page>
  );
}
