import Link from "next/link";

const NavAuth = () => {
  return (
    <>
      <nav className="w-full h-24 flex items-center justify-center px-8 shadow-sm bg-white border-b border-gray-200 sticky top-0 z-10">
        {/* Logo Section */}
        <Link href="/" className="flex items-center">
          <img
            src="/Logo.png"
            alt="Panganku Fresh Logo"
            className="w-48 h-14 object-contain"
          />
        </Link>
      </nav>
    </>
  );
}

export default NavAuth;
