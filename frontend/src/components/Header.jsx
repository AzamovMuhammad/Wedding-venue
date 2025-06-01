import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import logo from "../assets/logo/logo.png";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Header() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState();

  const [navigation, setNavigation] = useState([
    { name: "Dashboard", href: "/", current: false },
    { name: "Calendar", href: "/bookingDate", current: false },
  ]);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogOut = () => {
    localStorage.removeItem("token");
    handleLogin();
  };

  const token = localStorage.getItem("token");
  useEffect(() => {
    if (!token) return;

    axios
      .get("http://localhost:4001/profile/info", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUserInfo(res.data);

        if (res.data.role === "owner" || res.data.role === "admin") {
          setNavigation((prev) => [
            ...prev,
            { name: "Add Venue", href: "/create", current: false },
            { name: "Booking", href: "/viewBookings", current: false },
          ]);
        } else if (res.data.role === "user") {
          setNavigation((prev) => [
            ...prev,
            { name: "Booking", href: "/viewBookings", current: false },
          ]);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);
  console.log(userInfo);

  return (
    <Disclosure as="nav" className="bg-pink-100/80 shadow-md fixed z-40 w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <DisclosureButton className="inline-flex items-center justify-center rounded-md p-2 text-pink-700 hover:bg-pink-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-400">
              <Bars3Icon className="block size-6" aria-hidden="true" />
              <XMarkIcon className="hidden size-6" aria-hidden="true" />
            </DisclosureButton>
          </div>

          <div className="flex flex-1 items-center justify-center sm:items-center sm:justify-start">
            <div className="flex shrink-0 items-center cursor-pointer">
              <img alt="Wedding Logo" src={logo} className="h-15 w-15" />
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      item.current
                        ? "bg-pink-300 text-white"
                        : "text-pink-700 hover:bg-pink-200 hover:text-pink-900",
                      "rounded-full px-4 py-2 text-sm font-medium transition"
                    )}>
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center gap-4 pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {token && userInfo && userInfo.role !== "admin" ? (
              <Menu as="div" className="relative ml-3">
                <div className="flex items-center gap-3">
                  {userInfo && (
                    <span className="text-pink-700 font-medium">
                      {userInfo.firstname}
                    </span>
                  )}
                  <MenuButton className="rounded-full border-2 border-pink-300 focus:ring-2 focus:ring-pink-400">
                    <img
                      className="h-10 w-10 rounded-full"
                      src="https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d"
                      alt="User Avatar"
                    />
                  </MenuButton>
                </div>
                <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-pink-200 focus:outline-none">
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-pink-700 hover:bg-pink-100">
                      Your Profile
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-pink-700 hover:bg-pink-100">
                      Settings
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      onClick={handleLogOut}
                      href="#"
                      className="block px-4 py-2 text-sm text-pink-700 hover:bg-pink-100">
                      Log out
                    </a>
                  </MenuItem>
                </MenuItems>
              </Menu>
            ) : (
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 text-sm font-medium text-pink-700 bg-pink-200 rounded-l-md hover:bg-pink-300 transition">
                  Log in
                </button>
                <button
                  onClick={() => {
                    navigate("/register");
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-pink-500 rounded-r-md hover:bg-pink-600 transition">
                  Sign up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-4 pt-2 pb-3">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              className={classNames(
                item.current
                  ? "bg-pink-300 text-white"
                  : "text-pink-700 hover:bg-pink-200",
                "block rounded-full px-3 py-2 text-base font-medium transition"
              )}>
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}
