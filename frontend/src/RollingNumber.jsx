import { memo } from 'react'

/**
 * An odometer for a changing number: only the digits that actually changed
 * roll, and they roll in the direction the number moved.
 *
 * The whole effect is carried by React's reconciliation rather than by any
 * animation bookkeeping. Each column is keyed by its position, so it survives
 * a re-render and never re-animates; the digit inside it is keyed by its own
 * character, so changing it is a remount, and a remount is what restarts a CSS
 * animation. A digit that didn't change keeps its key, keeps its element, and
 * therefore stays perfectly still.
 *
 * That falls out correctly for carries without a special case: 20 300 -> 20 400
 * differs in one column, so one digit rolls, while 3 999 -> 4 000 differs in
 * four, so four roll together.
 *
 * Columns are keyed by position counted from the RIGHT. Keying from the left
 * would mean 999 -> 1 000 shifts every digit into a new column and animates the
 * entire number, when what actually happened is that a place was added on the
 * end and the rest carried.
 *
 * Thousands are separated by an empty, CSS-sized cell rather than by a comma
 * or a space character. Two reasons: a whitespace-only flex item collapses to
 * nothing, which loses the grouping entirely, and toLocaleString's choice of
 * separator follows the browser's locale — so the same tile would read
 * "4,000,000" for one visitor and "4.000.000" for another. A gap is the same
 * everywhere and cannot be mistaken for a decimal point.
 */

/**
 * One digit, frozen against everything except its own character.
 *
 * The comparator ignores `direction` on purpose, and it is the only reason a
 * downward tick doesn't animate the whole number. Direction decides
 * `animation-name`, and changing `animation-name` on an element restarts its
 * animation — so if a persisting digit were allowed to re-render when the
 * count switched from rising to falling, every digit on screen would roll,
 * not just the one that moved. Skipping the update leaves the unchanged digits
 * holding the class they mounted with, which is correct: their animation
 * finished long ago and must not be restarted.
 *
 * A digit that genuinely changes gets a new key, so it remounts rather than
 * updates, and picks up the current direction on the way in.
 */
const Digit = memo(
  function Digit({ ch, direction }) {
    return <span className={`roll-digit roll-${direction}`}>{ch}</span>
  },
  (prev, next) => prev.ch === next.ch,
)

export function RollingNumber({ value, direction = 'up', className = '' }) {
  const rounded = Math.round(value)
  const digits = [...Math.abs(rounded).toString()]
  const width = digits.length

  const cells = []
  digits.forEach((ch, i) => {
    // 1-based from the right, so a digit's identity survives the number
    // gaining or losing a leading place.
    const column = width - i

    cells.push(
      <span key={`col${column}`} className="roll-cell">
        <Digit key={ch} ch={ch} direction={direction} />
      </span>,
    )

    // A gap after this digit when a whole number of groups remains to its
    // right — i.e. between every third digit, never leading.
    if (column > 1 && (column - 1) % 3 === 0) {
      cells.push(<span key={`sep${column}`} className="roll-sep" />)
    }
  })

  return (
    // The digits are decoration as far as assistive tech is concerned: read one
    // cell at a time they come out as "4 0 0 0 0 0 0". The label carries the
    // number as a number instead.
    <span className={`roll-number ${className}`.trim()} aria-label={rounded.toLocaleString()}>
      <span aria-hidden="true" className="roll-inner">
        {rounded < 0 && <span className="roll-sign">−</span>}
        {cells}
      </span>
    </span>
  )
}
