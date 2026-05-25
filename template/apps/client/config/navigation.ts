import type { NavigationItem } from "@hillbilly/ui/context/navigation";
import type { PermissionKeys } from "@hillbilly/ui/types/permission-keys";
import { LayoutIcon, UsersIcon } from "lucide-react";

export const navigationConfig = {
	admin: [
		{
			title: "Dashboard",
			url: "/admin/dashboard",
			icon: LayoutIcon,
		},
		{
			title: "User Management",
			url: "/admin/users",
			icon: UsersIcon,
			items: [
				{
					title: "Users",
					url: "/admin/users",
					permission: "user.view",
				},
				// {
				// 	title: "Roles",
				// 	url: "/admin/roles",
				// 	permission: "role.view",
				// },
			],
		},
		// 	{
		// 		title: "Inventory",
		// 		url: "/admin/inventory",
		// 		icon: StoreIcon,
		// 		items: [
		// 			{
		// 				title: "Brands",
		// 				url: "/admin/inventory/brands",
		// 				permission: "brand.view",
		// 			},
		// 			{
		// 				title: "Categories",
		// 				url: "/admin/inventory/categories",
		// 				permission: "category.view",
		// 			},
		// 			{
		// 				title: "Vouchers",
		// 				url: "/admin/inventory/vouchers",
		// 				permission: "voucher.view",
		// 			},
		// 		],
		// 	},
		// 	{
		// 		title: "Organizations",
		// 		url: "/admin/organizations",
		// 		icon: BuildingIcon,
		// 		permission: "organization.view",
		// 	},
		// 	{
		// 		title: "Pricelist",
		// 		url: "/admin/pricelists",
		// 		icon: Rows4,
		// 		permission: "pricelist.view",
		// 	},
		// 	{
		// 		title: "Orders",
		// 		url: "/admin/orders",
		// 		icon: ShoppingCartIcon,
		// 		permission: "order.view",
		// 	},
		// 	{
		// 		title: "Exchange Rates",
		// 		url: "/admin/exchange-rates",
		// 		icon: BadgeDollarSignIcon,
		// 		permission: "exchange-rate.view",
		// 	},
		// 	{
		// 		title: "Reports",
		// 		url: "/admin/reports",
		// 		icon: ChartAreaIcon,
		// 	},
		// ],
		// org: [
		// 	{
		// 		title: "Home",
		// 		url: "/org/home",
		// 		icon: HomeIcon,
		// 	},
		// 	{
		// 		title: "Orders",
		// 		url: "/org/orders",
		// 		icon: ShoppingCartIcon,
		// 		permission: "order.view",
		// 	},
		// 	{
		// 		title: "Inventory",
		// 		url: "/org/inventory",
		// 		icon: PackageIcon,
		// 	},
		// 	{
		// 		title: "Activity",
		// 		url: "/org/activity",
		// 		icon: ActivityIcon,
		// 	},
		// 	{
		// 		title: "Settings",
		// 		url: "/org/settings",
		// 		icon: SettingsIcon,
		// 	},
	],
} satisfies Record<string, NavigationItem<PermissionKeys>[]>;
