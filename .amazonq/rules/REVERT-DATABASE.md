# Database Revert & Restoration Guide

## Overview
This document provides instructions for reverting the database schema and documentation to its original state (as of 2026-03-24). Use these steps if an experimental implementation causes issues in production or local environments.

---

## 1. Documentation Revert
To restore the `@.amazonq/rules/DATABASE.md` file to its original state:

### Manual Copy
Run the following command in your terminal:
```bash
cp .amazonq/rules/DATABASE_BACKUP_20260324.md .amazonq/rules/DATABASE.md
```

---

## 2. SQL Schema Rollback
If you have applied migrations for Joint Accounts and need to undo them, execute the following SQL in the Supabase SQL Editor:

```sql
-- 1. Drop the junction table (This will remove ALL sharing data)
DROP TABLE IF EXISTS account_shares;

-- 2. Restore Bank Cards Policies
DROP POLICY IF EXISTS "Users can view their own cards" ON bank_cards;
CREATE POLICY "Users can view their own cards" ON bank_cards
  FOR ALL USING (auth.uid() = user_id);

-- 3. Restore E-Wallets Policies
DROP POLICY IF EXISTS "Users can view their own wallets" ON e_wallets;
CREATE POLICY "Users can view their own wallets" ON e_wallets
  FOR ALL USING (auth.uid() = user_id);

-- 4. Restore Transactions Policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

-- 5. Drop Helper Functions
DROP FUNCTION IF EXISTS is_account_member;
```

---

## 3. Pre-flight Checks
Before performing a revert:
1. **Backup Data**: Export your current transactions to CSV if you have new data you want to keep.
2. **Warn Users**: If in production, notify shared users that their access will be revoked.
3. **Verify ID**: Ensure that `auth.uid() = user_id` is still the correct primary logic for your environment.

---

## 4. Verification
After reverting:
1. Check the Dashboard to ensure only your owned accounts are visible.
2. Try adding a transaction to confirm RLS is still working correctly.
3. Verify that the `.amazonq/rules/DATABASE.md` file no longer contains `account_shares`.
