import { useMainContext } from '@/context/main-context';
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
  const { groups, courses } = useMainContext();
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
          href: '',
          label: "Guruhlar ro'yxati",
          active: pathname.includes('/groups'),
          icon: GraduationCapIcon,
          submenus: groups.map((group) => ({
            href: `/groups/${group.id}`, // Dynamic URL for each group
            label:
              courses.filter((item) => item.id === group.courseId)[0]
                .courseTitle +
              ' ' +
              '#' +
              group.groupNumber,
            active: pathname === `/groups/${group.id}`,
          })), // Map over the groups array to create submenus
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
