export default function Footer() {
  return (
    <footer className="w-full border-t bg-white dark:bg-dark-header px-4 py-8 text-center text-sm text-gray-500">
      &copy; {new Date().getFullYear()} My Blog. All rights reserved.
    </footer>
  );
}