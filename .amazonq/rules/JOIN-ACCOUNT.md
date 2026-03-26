# Joint Accounts (Per-Account Sharing) Implementation Guide

## Overview

The **Joint Accounts** feature allows PennyWings users to share specific bank cards or e-wallets with other users via their email addresses. This implementation follows the **Junction Table Pattern** for multi-user access while maintaining strict Row Level Security (RLS) and data integrity.

---

## 1. Database Schema Extensions

### `account_shares` Table
A new table to manage the many-to-many relationship between users and accounts.

| Column | Data Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `owner_id` | `uuid` | FK to `auth.users` (The person who owns the account) |
| `card_id` | `uuid` | FK to `bank_cards` (Nullable if e-wallet) |
| `wallet_id` | `uuid` | FK to `e_wallets` (Nullable if card) |
| `shared_with_email` | `text` | The email address of the invited user |
| `shared_with_user_id` | `uuid` | FK to `auth.users` (Resolved when the user accepts) |
| `status` | `text` | `pending` or `accepted` |
| `role` | `text` | `viewer` or `editor` (default: `editor`) |
| `created_at` | `timestamptz` | `now()` |

---

## 2. Row Level Security (RLS) Design

The current RLS policies strictly limit access to the `user_id`. We must update these to allow access if a user is either the **owner** OR a **shared member** with an `accepted` status.

### SQL Migration Strategy

```sql
-- 1. Create the junction table
CREATE TABLE account_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id uuid REFERENCES bank_cards(id) ON DELETE CASCADE,
  wallet_id uuid REFERENCES e_wallets(id) ON DELETE CASCADE,
  shared_with_email text NOT NULL,
  shared_with_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  role text DEFAULT 'editor' CHECK (role IN ('viewer', 'editor')),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT one_account_type CHECK (
    (card_id IS NOT NULL AND wallet_id IS NULL) OR 
    (card_id IS NULL AND wallet_id IS NOT NULL)
  )
);

-- 2. Update bank_cards policies
ALTER POLICY "Users can view their own cards" ON bank_cards
USING (
  user_id = auth.uid() OR 
  id IN (
    SELECT card_id FROM account_shares 
    WHERE shared_with_user_id = auth.uid() AND status = 'accepted'
  )
);

-- 3. Update transactions policies
ALTER POLICY "Users can view their own transactions" ON transactions
USING (
  user_id = auth.uid() OR
  card_id IN (SELECT card_id FROM account_shares WHERE shared_with_user_id = auth.uid() AND status = 'accepted') OR
  wallet_id IN (SELECT wallet_id FROM account_shares WHERE shared_with_user_id = auth.uid() AND status = 'accepted')
);
```

---

## 3. Hook & Logic Updates

### `useBankCards` & `useEWallets`
Update the fetching logic to include shared accounts. Since RLS is updated, a simple `select('*')` will automatically return both owned and shared accounts.

**Filtering Tip:** Add a `is_shared` boolean property to the mapped data in the hook to differentiate UI elements.

### `useTransactions`
When adding a transaction to a shared account, the `transactions.user_id` will be the `auth.uid()` of the contributor, but the `card_id` will belong to the owner. The balance update logic must ensure that the shared account's balance is updated globally.

---

## 4. UI/UX Requirements

### Share Account Modal
A new modal triggered from the Account list or Edit screen:
- **Input**: Email address.
- **Role Selection**: Viewer (Read-only) or Editor (Can add/edit transactions).
- **List**: Show current shares with 'Remove' option.

### Dashboard & Navigation
- **Shared Badge**: A small 'Joint' icon or badge on account cards that are shared.
- **Invitation Alert**: A notification on the Dashboard if there are `pending` shares for the current user's email.
- **Net Worth Calculation**: Shared accounts should be toggleable in the Net Worth calculation (some users might want to exclude shared pools).

### Real-time Sync
Ensure that `account_shares` changes trigger cache invalidation for `bank_cards` and `e_wallets` to reflect new permissions immediately.

---

## 5. Performance Considerations

- **Security Definer Function**: To avoid deep nesting in RLS, use a function to check membership:
  ```sql
  CREATE OR REPLACE FUNCTION is_account_member(account_id uuid, user_id uuid)
  RETURNS boolean AS $$
    SELECT EXISTS (
      SELECT 1 FROM account_shares 
      WHERE (card_id = account_id OR wallet_id = account_id) 
      AND (shared_with_user_id = user_id OR owner_id = user_id)
      AND status = 'accepted'
    );
  $$ LANGUAGE sql SECURITY DEFINER;
  ```

---

## 6. Security Risks

- **Information Leakage**: Do not expose the owner's full transaction history to the shared user unless explicitly accepted.
- **Audit Logs**: Ensure `transactions` table tracks the `created_by` (already captured in `user_id` currently, but we must distinguish it from the *Account Owner*).

---

## 7. Next Steps

1. [ ] Apply `account_shares` table migration.
2. [ ] Update RLS policies for `bank_cards`, `e_wallets`, and `transactions`.
3. [ ] Build `ShareAccountModal` component.
4. [ ] Implement invitation acceptance logic in `useDashboardData`.
5. [ ] Update UI badges and filters in `Accounts.jsx`.
