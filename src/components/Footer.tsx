import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1F1A5E] text-white text-sm py-4">
      <div className="max-w-screen-xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>© {new Date().getFullYear()} Simple Steps. All rights reserved.</span>
        <div className="flex gap-4">
          <Link href="/" className="hover:underline">Privacy</Link>
          <Link href="/" className="hover:underline">Terms</Link>
        </div>
      </div>
    </footer>
  );
}