export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const copy = [...list];
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= copy.length ||
    to >= copy.length
  )
    return copy;
  const [item] = copy.splice(from, 1);
  if (item === undefined) return copy;
  copy.splice(to, 0, item);
  return copy;
}
