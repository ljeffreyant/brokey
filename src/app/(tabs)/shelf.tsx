import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Recurring, ShameItem, allStickers, bleedTotals, categoryMeta, detectRecurring, unlockedStickerIds } from '../../core';
import { catLabel, useT } from '../../i18n';
import { useStore } from '../../store';
import { useTheme } from '../../theme';
import { IconDisc } from '../../ui/CatIcon';
import { CategoryPicker } from '../../ui/CategoryPicker';
import { Sheet } from '../../ui/Sheet';
import { StickerArt } from '../../ui/StickerArt';
import { Txt } from '../../ui/Txt';
import { Btn, Card, Chip, Field, RoundBtn, SectionTitle, Slab } from '../../ui/kit';
import { Keypad } from '../../ui/Keypad';
import { haptic } from '../../ui/haptics';
import { formatDate, useFmt, useNow } from '../../ui/useFmt';
import { formatTyped } from '../../core/keypad';
import { currencyDef, parseAmountToCents } from '../../core';
import { sfx } from '../../ui/sfx';
import { puff } from '../../ui/clay';

function ShameCard({ item, w, tilt, onPress }: { item: ShameItem; w: number; tilt: number; onPress: () => void }) {
  const p = useTheme();
  const t = useT();
  const f = useFmt();
  const meta = categoryMeta(item.category ?? 'other');
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={item.label} onPress={() => { haptic.tap(); onPress(); }} style={{ width: w, transform: [{ rotate: `${tilt}deg` }] }}>
      <Slab r={20} depth={5} inner={{ padding: 8 }}>
        <View>
          <View style={{ backgroundColor: p.groups[meta.group].bg, borderRadius: 11, height: w * 0.52, alignItems: 'center', justifyContent: 'center', ...puff(p, p.groups[meta.group].bg, 2) }}>
            <IconDisc id={meta.icon} size={w * 0.44} color="transparent" />
          </View>
          <Txt v="bodyBold" numberOfLines={1} style={{ marginTop: 8 }}>
            {item.label}
          </Txt>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Txt v="num" size={18}>
              {f.hspNum(item.amountCents)}
            </Txt>
            <Txt v="small" faint>
              {f.money(item.amountCents)}
            </Txt>
          </View>
          {item.source === 'regret' ? (
            <View style={{ position: 'absolute', top: 6, right: 6, backgroundColor: p.accent, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, ...puff(p, p.accent, 2) }}>
              <Txt v="label" size={8.5} color={p.onAccent}>
                {t('shelf.nope')}
              </Txt>
            </View>
          ) : null}
        </View>
      </Slab>
    </Pressable>
  );
}

export default function Shelf() {
  const p = useTheme();
  const t = useT();
  const f = useFmt();
  const ins = useSafeAreaInsets();
  const { width: W } = useWindowDimensions();
  const now = useNow(60000);
  const shame = useStore((s) => s.shame);
  const state = useStore();
  const addShame = useStore((s) => s.addShame);
  const removeShame = useStore((s) => s.removeShame);
  const [open, setOpen] = useState<ShameItem | null>(null);
  const [adding, setAdding] = useState(false);

  const cw = Math.floor((W - 36 - 14) / 2);
  const total = shame.reduce((n, x) => n + x.amountCents, 0);
  const rows = useMemo(() => {
    const out: ShameItem[][] = [];
    for (let i = 0; i < shame.length; i += 2) out.push(shame.slice(i, i + 2));
    return out;
  }, [shame]);

  const recurringAll = useMemo(() => detectRecurring(state.purchases, now), [state.purchases, now]);
  const recurring = useMemo(() => recurringAll.slice(0, 5), [recurringAll]);
  const bleed = useMemo(() => bleedTotals(recurringAll), [recurringAll]);
  const onShelf = (r: Recurring) => shame.some((x) => x.label.trim().toLowerCase() === r.label.toLowerCase());
  const everyKey = (r: Recurring) => (r.everyDays === 7 ? 'recurring.weekly' : r.everyDays === 14 ? 'recurring.fortnightly' : 'recurring.monthly');

  const stickers = useMemo(() => allStickers(), []);
  const unlocked = useMemo(
    () => new Set(unlockedStickerIds({ purchases: state.purchases, wishes: state.wishes, shame: state.shame, settings: state.settings, wallets: state.wallets, now })),
    [state.purchases, state.wishes, state.shame, state.settings, state.wallets, now],
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: p.bg }} contentContainerStyle={{ paddingTop: ins.top + 8, paddingHorizontal: 18, paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Txt v="display">{t('shelf.title')}</Txt>
          <Txt v="small" dim>
            {t('shelf.sub')}
          </Txt>
        </View>
        <RoundBtn glyph="plus" label={t('shelf.add')} fill={p.accent2} color={p.onAccent2} onPress={() => setAdding(true)} />
      </View>

      {shame.length > 0 ? (
        <Card fill={p.accent} inner={{ paddingVertical: 12 }}>
          <Txt v="label" color={p.onAccent} style={{ opacity: 0.8 }}>
            {t('shelf.total')}
          </Txt>
          <Txt v="display" color={p.onAccent}>
            {f.hsp(total)}
          </Txt>
          <Txt v="small" color={p.onAccent} style={{ fontFamily: 'DMSans_700Bold' }}>
            {f.sum(total)} · {t.n('shelf.items', shame.length)}
          </Txt>
        </Card>
      ) : null}

      {recurring.length > 0 ? (
        <Card style={{ marginTop: 14 }} inner={{ gap: 12 }}>
          <View>
            <Txt v="heading">{t('recurring.title')}</Txt>
            <Txt v="small" dim>
              {t('recurring.sub')}
            </Txt>
            {recurringAll.length > 1 ? (
              <Txt v="small" style={{ fontFamily: 'DMSans_700Bold', marginTop: 4 }}>
                {t('recurring.bleed', { month: f.hsp(bleed.monthlyCents), year: f.hsp(bleed.yearlyCents) })}
              </Txt>
            ) : null}
          </View>
          {recurring.map((r) => {
            const shelved = onShelf(r);
            return (
              <View key={r.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <IconDisc id={categoryMeta(r.category).icon} size={42} ring />
                <View style={{ flex: 1 }}>
                  <Txt v="bodyBold" numberOfLines={1}>
                    {r.label}
                  </Txt>
                  <Txt v="small" dim numberOfLines={2}>
                    {f.money(r.amountCents)} {t(everyKey(r) as never)} · {t('recurring.year', { amount: f.sum(Math.round(r.yearlyCents / 100) * 100) })}
                  </Txt>
                </View>
                <Btn
                  label={shelved ? t('recurring.shelved') : t('recurring.shelve')}
                  size="sm"
                  compact
                  tone={shelved ? 'card' : 'dark'}
                  disabled={shelved}
                  onPress={() => addShame({ label: r.label, amountCents: r.amountCents, category: r.category, story: t('recurring.story'), source: 'manual' })}
                />
              </View>
            );
          })}
        </Card>
      ) : null}

      <View style={{ marginTop: 18, gap: 4 }}>
        {shame.length === 0 ? (
          <Card inner={{ alignItems: 'center', gap: 8, paddingVertical: 28 }}>
            <Txt v="heading" align="center">
              {t('shelf.emptyTitle')}
            </Txt>
            <Txt v="small" dim align="center">
              {t('shelf.emptyBody')}
            </Txt>
            <Btn label={t('shelf.add')} glyph="plus" onPress={() => setAdding(true)} />
          </Card>
        ) : (
          rows.map((row, ri) => (
            <Animated.View key={ri} entering={FadeInDown.delay(ri * 60)}>
              <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-end', paddingHorizontal: 0, marginBottom: -2 }}>
                {row.map((it, ci) => (
                  <ShameCard key={it.id} item={it} w={cw} tilt={(ri + ci) % 2 === 0 ? -1.6 : 1.8} onPress={() => setOpen(it)} />
                ))}
              </View>
              <View style={{ height: 16, marginTop: 2, marginBottom: 18, backgroundColor: '#B56D36', borderRadius: 8, ...puff(p, '#B56D36', 5) }} />
            </Animated.View>
          ))
        )}
      </View>

      <SectionTitle>{t('shelf.trophies')}</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {stickers.map((s, i) => {
          const on = unlocked.has(s.id);
          const w = Math.floor((W - 36 - 20) / 3);
          return (
            <View key={s.id} style={{ width: w, alignItems: 'center', gap: 6, paddingVertical: 6 }}>
              <StickerArt art={s.art} size={w * 0.74} index={i} locked={!on} />
              <Txt v="small" align="center" style={{ fontFamily: 'DMSans_700Bold', fontSize: 12, lineHeight: 15 }} color={on ? p.text : p.textFaint} numberOfLines={2}>
                {on ? t(`sticker.${s.id}.title` as never) : '???'}
              </Txt>
              {on ? (
                <Txt v="small" faint align="center" style={{ fontSize: 10.5, lineHeight: 13 }} numberOfLines={3}>
                  {t(`sticker.${s.id}.blurb` as never)}
                </Txt>
              ) : null}
            </View>
          );
        })}
      </View>

      <Sheet visible={!!open} onClose={() => setOpen(null)} title={open?.label}>
        {open ? (
          <View style={{ gap: 12, paddingBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <IconDisc id={categoryMeta(open.category ?? 'other').icon} size={60} color={p.groups[categoryMeta(open.category ?? 'other').group].bg} ring />
              <View style={{ flex: 1 }}>
                <Txt v="display" size={32}>
                  {f.hsp(open.amountCents)}
                </Txt>
                <Txt v="small" dim>
                  {f.money(open.amountCents)} · {formatDate(open.ts, f.lang)}
                </Txt>
              </View>
            </View>
            {open.story ? (
              <Card fill={p.card2} depth={0} inner={{ padding: 14 }}>
                <Txt v="body">“{open.story}”</Txt>
              </Card>
            ) : null}
            <Txt v="small" dim>
              {open.category ? catLabel(t, categoryMeta(open.category)) : ''}
            </Txt>
            <Btn label={t('shelf.remove')} tone="card" glyph="trash" full onPress={() => { removeShame(open.id); setOpen(null); }} />
          </View>
        ) : null}
      </Sheet>

      <AddShameSheet
        visible={adding}
        onClose={() => setAdding(false)}
        onAdd={(label, cents, cat, story) => {
          addShame({ label, amountCents: cents, category: cat, story: story || undefined, source: 'manual' });
          haptic.good();
          sfx.play('nope');
          setAdding(false);
        }}
      />
    </ScrollView>
  );
}

function AddShameSheet({ visible, onClose, onAdd }: { visible: boolean; onClose: () => void; onAdd: (label: string, cents: number, cat: string, story: string) => void }) {
  const p = useTheme();
  const t = useT();
  const settings = useStore((s) => s.settings);
  const [label, setLabel] = useState('');
  const [story, setStory] = useState('');
  const [amount, setAmount] = useState('');
  const [cat, setCat] = useState('random');
  const [pick, setPick] = useState(false);
  const cents = parseAmountToCents(amount) ?? 0;
  const meta = categoryMeta(cat);
  const reset = () => {
    setLabel('');
    setStory('');
    setAmount('');
    setCat('random');
  };
  return (
    <Sheet visible={visible} onClose={onClose} title={t('shelf.addTitle')}>
      <View style={{ gap: 12, paddingBottom: 8 }}>
        <Field value={label} onChangeText={setLabel} placeholder={t('shelf.whatPh')} glyph="edit" maxLength={40} />
        <Field value={story} onChangeText={setStory} placeholder={t('shelf.storyPh')} multiline maxLength={140} inputStyle={{ minHeight: 44 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Chip label={catLabel(t, meta)} on color={p.groups[meta.group].bg} onPress={() => setPick((v) => !v)} />
          <View style={{ flex: 1 }} />
          <Txt v="title" dim>
            {currencyDef(settings.currency).symbol}
          </Txt>
          <Txt v="display" size={34} color={cents > 0 ? p.text : p.textFaint}>
            {amount ? formatTyped(amount, settings.language) : '0'}
          </Txt>
        </View>
        {pick ? (
          <View style={{ height: 360, marginHorizontal: -20 }}>
            <CategoryPicker value={cat} onPick={(id) => { setCat(id); setPick(false); }} />
          </View>
        ) : (
          <Keypad value={amount} onChange={setAmount} zeroDecimal={!!currencyDef(settings.currency).zeroDecimal} keyH={44} />
        )}
        <Btn
          label={t('shelf.addCta')}
          full
          glyph="check"
          disabled={cents <= 0 || label.trim().length === 0}
          onPress={() => {
            onAdd(label.trim(), cents, cat, story.trim());
            reset();
          }}
        />
      </View>
    </Sheet>
  );
}
