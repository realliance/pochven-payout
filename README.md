# pochven-payout

EVE Online Pochven Pay Tool

# Requirements

## Setup

- Get Names from Fleet Chat (Ctrl A, Ctrl C, Ctrl V, one name per newline, might be able to use the fleet api?)
- Check Local Storage Look Up Table for Known Alts
- For any unknown ones, drag them on top of their owners to sort them
- Allow exporting of known alt lists

Players have one main and possibly many alts.
Characters are marked as "mains" or "alt of X", "eligible" or "ineligible" of payout, part of the site payout or not. Include a box to modify eligiblity for a whole user group.

## Pay In

- Input expected payout
- There is a roughly known payout per person in a site payout, watch wallet transactions for it. This should be able to handle one transaction per player, or multiple per player to add up to the expected.

## Calculate Shares

- Take off the top for Corp Programs
- Calculate total shares: 1 share for Main, 1/2 share per alt, up to 2.5 shares total (configurable)
- Divide remaining by shares

## Pay Out Process

- Begin loop of paying everyone out:
- API Triggers Open Character Screen
- Click Hamburger, Give ISK
- Paste ISK to Give
- Click Ok
- Detect payment, then cycle to the next person (or hit next)
