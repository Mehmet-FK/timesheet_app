import "./globals.css";

export const metadata = {
  title: "Arbeitszeit Dokumentation",
  description: "Monthly working time records for coworkers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
