# PostgreSQL setup

1. Create a PostgreSQL database.

2. Copy `.env.example` to `.env.local` and update `DATABASE_URL`.

   ```bash
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/timesheet_app
   ```

3. Run the migrations:

   ```bash
   npm run db:migrate
   ```

4. Create or update the admin login:

   ```bash
   npm run admin:create -- admin@example.com secure-password
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

The app stores admins in `admins`, admin sessions in `admin_sessions`, tenants
in `companies`, company login sessions in `company_sessions`, coworker profile
data in `coworkers`, weekly schedule rows in `coworker_workdays`, and
sick/vacation/other ranges in `coworker_absences`.

Each company has a `credit_balance`. Timesheet generation consumes credits as
`1 coworker x 1 month = 1 credit`.

Open the admin dashboard at `/admin` and sign in with the admin email/password.
