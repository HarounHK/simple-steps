import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-blue-500 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-lg font-bold">Simple Steps</h1>
        <div className="space-x-4">
          <Link href="/Login" className="bg-white text-blue-500 px-4 py-2 rounded hover:bg-blue-100">
            Login
          </Link>
          <Link href="/Signup" className="bg-white text-blue-500 px-4 py-2 rounded hover:bg-blue-100">
            Signup
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;