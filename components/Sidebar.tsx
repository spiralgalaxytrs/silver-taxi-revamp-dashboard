"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "lib/utils";
import {
  FileText,
  Truck,
  User,
  AudioWaveform,
  BadgePercent,

  Calendar,
  Settings,
  CreditCard,
  UserCheck,
  SquareChevronDown,
  SquareChevronRight,
  LayoutDashboard,
  Users,
  Route,
  PackagePlus,
  ChartColumnIncreasing,
  MapPin,
  BookOpenCheck,
  HandCoins,
  TicketPercent
} from "lucide-react";
import Image from "next/image";
import { useProfileStore } from "stores/profileStore";

// Add these type definitions at the top of the file
type SubDropdownItem = {
  name: string;
  href: string;
  icon: any;
};

type DropdownItem = {
  name: string;
  href?: string;
  icon: any;
  subDropdown?: SubDropdownItem[];
};

const AdminSidebarItems: {
  name: string;
  href?: string;
  icon: any;
  dropdown?: DropdownItem[];
}[] = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    {
      name: "Enquiries",
      icon: Calendar,
      dropdown: [
        { name: "Enquiry", href: "/admin/enquiry", icon: SquareChevronRight },
        { name: "Manual Enquiry", href: "/admin/enquiry/create", icon: SquareChevronRight },
      ],
    },
    {
      name: "Bookings",
      icon: Calendar,
      dropdown: [
        { name: "Booking", href: "/admin/bookings", icon: SquareChevronRight },
        { name: "Manual Booking", href: "/admin/bookings/create", icon: SquareChevronRight },
      ],
    },
    { name: "Customers", href: "/admin/customers", icon: Users },
    {
      name: "Drivers",
      icon: UserCheck,
      dropdown: [
        { name: "Driver", href: "/admin/drivers", icon: SquareChevronRight },
        { name: "Create Driver", href: "/admin/drivers/create", icon: SquareChevronRight },
      ],
    },
    {
      name: "Vendors",
      icon: User,
      dropdown: [
        { name: "Vendor", href: "/admin/vendor", icon: SquareChevronRight },
        { name: "Create Vendor", href: "/admin/vendor/create", icon: SquareChevronRight },
      ],
    },
    {
      name: "Services",
      icon: Settings,
      dropdown: [
        {
          name: "Outstation",
          icon: SquareChevronDown,
          subDropdown: [
            { name: "One Way", href: "/admin/services/one-way", icon: SquareChevronRight },
            { name: "Round Trip", href: "/admin/services/round-trip", icon: SquareChevronRight },
          ],
        },
        {
          name: "Packages",
          icon: SquareChevronDown,
          subDropdown: [
            // { name: "Day Packages", href: "/admin/services/packages/days", icon: SquareChevronRight },
            { name: "Hourly Packages", href: "/admin/services/packages/hourly", icon: SquareChevronRight },
          ],
        },
        // {
        //   name: "Airport",
        //   icon: SquareChevronDown,
        //   subDropdown: [
        //     { name: "Pickup ", href: "/admin/services/airport/pickup", icon: SquareChevronRight },
        //     { name: "Drop", href: "/admin/services/airport/drop", icon: SquareChevronRight },
        //   ],
        // },
      ],
    },
    {
      name: "Services Pricing",
      icon: HandCoins,
      dropdown: [
        {
          name: "Outstation Pricing",
          icon: SquareChevronDown,
          subDropdown: [
            { name: "One Way", href: "/admin/price-changes/outStation/oneway-pricing", icon: SquareChevronRight },
            { name: "Round Trip", href: "/admin/price-changes/outStation/roundtrip-pricing", icon: SquareChevronRight },
          ],
        },
        // {
        //   name: "Airport Pricing",
        //   icon: SquareChevronDown,
        //   subDropdown: [
        //     { name: "Pickup ", href: "/admin/price-changes/airport/pickup-pricing", icon: SquareChevronRight },
        //     { name: "Drop", href: "/admin/price-changes/airport/drop-pricing", icon: SquareChevronRight },
        //   ],
        // },
      ],
    },
    {
      name: "Vehicles",
      icon: Truck,
      dropdown: [
        { name: "Vehicle", href: "/admin/vehicles", icon: SquareChevronRight },
        { name: "Create Vehicle", href: "/admin/vehicles/create", icon: SquareChevronRight },
      ],
    },
    // {
    //   name: "Special Packages",
    //   icon: PackagePlus,
    //   dropdown: [
    //     { name: "Packages", href: "/admin/special-packages", icon: SquareChevronRight },
    //     { name: "Create Packages", href: "/admin/special-packages/create", icon: SquareChevronRight },
    //   ],
    // },
    {
      name: "Invoices",
      icon: FileText,
      dropdown: [
        { name: "Invoices", href: "/admin/invoices", icon: SquareChevronRight },
        { name: "Create Invoice", href: "/admin/invoices/create", icon: SquareChevronRight },
      ],
    },
    // { name: "Site Analytics", href: "/admin/iptracking", icon: ChartColumnIncreasing },
    // {
    //   name: "Blog",
    //   icon: BookOpenCheck,
    //   dropdown: [
    //     { name: "Blog", href: "/admin/blog", icon: SquareChevronRight },
    //     { name: "Create Blog", href: "/admin/blog/create", icon: SquareChevronRight },
    //   ]
    // },
    // {
    //   name: "Dynamic Routes",
    //   icon: Route,
    //   dropdown: [
    //     { name: "Dynamic Routes", href: "/admin/dynamic-routes", icon: SquareChevronRight },
    //     { name: "Create Dynamic Route", href: "/admin/dynamic-routes/create", icon: SquareChevronRight },
    //   ]
    // },
    // {
    //   name: "Popular Routes",
    //   icon: MapPin,
    //   dropdown: [
    //     { name: "Popular Routes", href: "/admin/popular-routes", icon: SquareChevronRight },
    //     { name: "Create Popular Route", href: "/admin/popular-routes/create", icon: SquareChevronRight },
    //   ]
    // },
    {
      name: "Offers",
      icon: BadgePercent,
      dropdown: [
        { name: "Offers", href: "/admin/offers", icon: SquareChevronRight },
        { name: "Create Offers", href: "/admin/offers/create", icon: SquareChevronRight },
      ],
    },

    {
      name: "Promo Code",
      icon: TicketPercent,
      dropdown: [
        { name: "Promo Codes", href: "/admin/promo-codes", icon: SquareChevronRight },
        { name: "Create Promo Codes", href: "/admin/promo-codes/create", icon: SquareChevronRight },
      ],
    },

    {
      name: "Payments",
      icon: CreditCard,
      dropdown: [
        // { name: "All Payment", href: "/admin/payments", icon:   SquareChevronRight },
        { name: "Customer Payment", href: "/admin/payments/general", icon: SquareChevronRight },
        // { name: "Customer Payment", href: "/admin/payments/customer", icon: SquareChevronRight },
        { name: "Driver Payment", href: "/admin/payments/driver", icon: SquareChevronRight },
        // { name: "Service Payment", href: "/admin/payments/service", icon: SquareChevronRight },
        { name: "Vendor Payment", href: "/admin/payments/vendor", icon: SquareChevronRight },
      ],
    },
  ];

const VendorSidebarItems: {
  name: string;
  href?: string;
  icon: any;
  dropdown?: DropdownItem[];
}[] = [
    { name: "Dashboard", href: "/vendor", icon: LayoutDashboard },
    {
      name: "Enquiries",
      icon: Calendar,
      dropdown: [
        { name: "Enquiry", href: "/vendor/enquiry", icon: SquareChevronRight },
        { name: "Manual Enquiry", href: "/vendor/enquiry/create", icon: SquareChevronRight },
      ],
    },
    {
      name: "Bookings",
      icon: Calendar,
      dropdown: [
        { name: "Booking", href: "/vendor/bookings", icon: SquareChevronRight },
        { name: "Manual Booking", href: "/vendor/bookings/create", icon: SquareChevronRight },
      ],
    },
    { name: "Customers", href: "/vendor/customers", icon: Users },
    {
      name: "Services",
      icon: Settings,
      dropdown: [
        {
          name: "Outstation",
          icon: SquareChevronDown,
          subDropdown: [
            { name: "One Way", href: "/vendor/services/one-way", icon: SquareChevronRight },
            { name: "Round Trip", href: "/vendor/services/round-trip", icon: SquareChevronRight },
          ],
        },
        {
          name: "Packages",
          icon: SquareChevronDown,
          subDropdown: [
            // { name: "Day Packages", href: "/vendor/services/packages/days", icon: SquareChevronRight },
            { name: "Hourly Packages", href: "/vendor/services/packages/hourly", icon: SquareChevronRight },
          ],
        },
        {
          name: "Airport",
          icon: SquareChevronDown,
          subDropdown: [
            { name: "Pickup ", href: "/vendor/services/airport/pickup", icon: SquareChevronRight },
            { name: "Drop", href: "/vendor/services/airport/drop", icon: SquareChevronRight },
          ],
        },
      ],
    },
    {
      name: "Vehicles", href: "/vendor/vehicles", icon: SquareChevronRight
    },
    {
      name: "Invoices",
      icon: FileText,
      dropdown: [
        { name: "Invoices", href: "/vendor/invoices", icon: SquareChevronRight },
        { name: "Create Invoice", href: "/vendor/invoices/create", icon: SquareChevronRight },
      ],
    },
  ];

interface CompanyProfile {
  logo: string | File | undefined;
}

export default function Sidebar({ createdBy }: { createdBy: string }) {
  const [cProfile, setCProfile] = useState<CompanyProfile | null>(null);
  const { fetchProfile, profile } = useProfileStore()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openSubDropdown, setOpenSubDropdown] = useState<string | null>(null);
  const sidebarItems = createdBy === "admin" ? AdminSidebarItems : VendorSidebarItems;

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {

        fetchProfile();
        const logoUrl = typeof profile?.logo === 'string' ? profile?.logo : '';
        setCProfile({
          ...profile,
          logo: logoUrl
        });
      } catch (error) {
        console.error("Error fetching company profile:", error);
      }
    };
    fetchCompanyProfile();
  }, []);

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
    setOpenSubDropdown(null); // Close sub-dropdown when main dropdown toggles
  };

  const toggleSubDropdown = (name: string) => {
    setOpenSubDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <div className="flex flex-col w-64 bg-white border-r overflow-y-auto scrollbar-hide">
      <div className="flex justify-center h-20 border-b">
        <div style={{ position: "relative", width: "120px", height: "60px", top: "-15px" }} className="p-4">
          {cProfile?.logo === 'string' && cProfile.logo ? (
            <Image
              src={cProfile.logo}
              alt="logo"
              priority
              width={120}
              height={60}
              quality={100}
              style={{ objectFit: "contain" }}
            />
          ) : (
            <Image
              src="/img/silver-logo.png"
              alt="logo"
              priority
              width={120}
              height={60}
              style={{ objectFit: "contain" }}
            />
          )}
          <Link href={`/img/logo-v1-white.png`} target="_blank" rel="noopener noreferrer"></Link>
          <Link href={`/img/logo-v1.png`} target="_blank" rel="noopener noreferrer"></Link>
        </div>

      </div>
      <nav className="flex-grow">
        <ul className="flex flex-col py-4">
          {sidebarItems.map((item) => (
            <li key={item.name}>
              {item.dropdown ? (
                <>
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className={cn("flex items-center px-6 py-2 text-gray-700 hover:bg-gray-100 w-full text-left")}
                  >
                    <item.icon className={`w-5 h-5 mr-3 ${openDropdown === item.name ? 'text-[#009F7F]' : ''}`} />
                    {item.name}
                  </button>
                  {openDropdown === item.name && (
                    <ul className="pl-6">
                      {item.dropdown.map((subItem) => (
                        <li key={subItem.name}>
                          {subItem.subDropdown ? (
                            <>
                              <button
                                onClick={() => toggleSubDropdown(subItem.name)}
                                className="flex items-center px-6 py-2 text-gray-600 hover:bg-gray-100 w-full text-left"
                              >
                                <subItem.icon className={`w-5 h-5 mr-3 ${openSubDropdown === subItem.name ? 'text-[#009F7F]' : ''}`} />
                                {subItem.name}
                              </button>
                              {openSubDropdown === subItem.name && (
                                <ul className="pl-6">
                                  {subItem.subDropdown.map((nestedItem) => (
                                    <li key={nestedItem.name}>
                                      <Link
                                        href={nestedItem.href}
                                        className="flex items-center px-6 py-2 text-gray-600 hover:bg-gray-100"
                                      >
                                        <nestedItem.icon className="w-5 h-5 mr-3" />
                                        {nestedItem.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </>
                          ) : (
                            <Link
                              href={subItem.href || ""}
                              className="flex items-center px-6 py-2 text-gray-600 hover:bg-gray-100"
                            >
                              <subItem.icon className="w-5 h-5 mr-3" />
                              {subItem.name}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link href={item.href || ""} className="flex items-center px-6 py-2 text-gray-700 hover:bg-gray-100">
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
