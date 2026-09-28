# Store Ratings Hub — Review Notes

## Preview

Open the running preview at:

`https://3000-iuegpbmvjeg04if92jeit-af5e2842.sg2.manus.computer`

## Demo access

Use the three buttons on the sign-in screen to jump into each role:

- **Administrator** — `admin@ratingshub.io` / `Admin@123`
- **Normal user** — `alex@ratingshub.io` / `Welcome@1`
- **Store owner** — `maya@ratingshub.io` / `Owner@123`

The demo buttons are intentional: they let reviewers evaluate each role without needing a pre-created account. Normal-user signup is also available from the sign-in screen.

## Challenge coverage

- Single sign-in surface with role-specific workspace navigation.
- Admin dashboard with total users, stores, submitted ratings, rating activity chart, role mix, top stores, recent users, directory management, add-store/add-user modals, filters, search, sorting, and user detail drawer.
- Normal user discovery with name/address search, category filtering, overall rating, personal submitted rating, submit/edit rating modal, activity history, and password settings.
- Store owner dashboard with owned-store rating average, response count, response health, and reviewer list.
- Validation for email, 20–60 character names, 400 character addresses, and 8–16 character passwords with uppercase and special-character rules.
- MySQL/Drizzle schema for `users`, `stores`, and `ratings`, including a unique `(storeId, userId)` rating constraint.
- Express/tRPC procedures for login, signup, password updates, store lists, rating upserts, admin operations, and owner summaries.

## Verification

```bash
pnpm check
pnpm test
pnpm build
```

All three commands pass in the completed build.
