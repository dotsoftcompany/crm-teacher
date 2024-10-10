import {
  User,
  Users,
  BookOpen,
  LayoutGrid,
  GraduationCapIcon,
  LayoutList,
  CalendarDays,
  ChartPie,
  UserRoundPen,
} from 'lucide-react';

export function getMenuList(pathname) {
  return [
    {
      groupLabel: '',
      menus: [
        {
          href: '/',
          label: 'Asosiy',
          active: pathname === '/',
          icon: LayoutGrid,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Ro'yxatlar",
      menus: [
        {
          href: '/lesson-schedule',
          label: 'Dars jadvali',
          active: pathname.includes('/lesson-schedule'),
          icon: CalendarDays,
          submenus: [],
        },
        {
          href: '/groups',
          label: "Guruhlar ro'yxati",
          active: pathname.includes('/groups'),
          icon: Users,
          submenus: [],
        },
        {
          href: '/students',
          label: "O'quvchilar ro'yxati",
          active: pathname.includes('/students'),
          icon: GraduationCapIcon,
          submenus: [
            {
              href: '/students',
              label: "O'quvchilar ro'yxati",
              active: pathname === '/students',
            },
            {
              href: '/add-student',
              label: "O'quvchilar qo'shish",
              active: pathname === '/add-student',
            },
          ],
        },
        {
          href: '/analytics',
          label: 'Hisobotlar',
          active: pathname.includes('/analytics'),
          icon: ChartPie,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: 'Account',
      menus: [
        {
          href: '/settings/account',
          label: 'Account',
          active: pathname === '/settings/account',
          icon: UserRoundPen,
          submenus: [],
        },
      ],
    },
  ];
}
