export default function Footer() {
  return (
    <footer className="bg-[#1F1A5E] text-white text-sm py-4">
      <div className="max-w-screen-xl mx-auto px-4 text-center">
        © {new Date().getFullYear()} Simple Steps. All rights reserved.
      </div>
    </footer>
  );
}