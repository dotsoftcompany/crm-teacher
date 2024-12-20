import React from 'react';

// ui
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookOpen, GraduationCapIcon, Users } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { BarGraph } from '@/components/charts/bar-graph';
import { RecentlyAdded } from '@/components/recently-added';
import { AreaGraph } from '@/components/charts/area-graph';
import { PieGraph } from '@/components/charts/pie-graph';
import { useMainContext } from '@/context/main-context';
import { SheetMenu } from '@/components/layout/sheet-menu';
import { MonthPicker } from '@/components/ui/month-picker';

function MainPage() {
  const { groups, teacherData, teachers, students } = useMainContext();
  const [month, setMonth] = React.useState(null);

  const totalStudents = groups.reduce((acc, group) => {
    if (group.status && group.students) {
      return acc + group.students.length;
    }
    return acc;
  }, 0);

  // https://github.com/Kiranism/next-shadcn-dashboard-starter
  return (
    <div className="px-8 mx-auto my-4 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between space-y-2">
          <div className="flex items-center gap-2">
            <SheetMenu />
            <h2 className="text-2xl font-bold tracking-tight">
              {teacherData.fullName}
            </h2>
          </div>
          <div className="hidden items-center space-x-2 md:flex">
            <MonthPicker month={month} setMonth={setMonth} />
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="dark:bg-background/95">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kurslar</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groups.length} ta</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="dark:bg-background/95">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guruhlar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groups.length} ta</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="dark:bg-background/95">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Talabalar</CardTitle>
            <GraduationCapIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents} ta</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <BarGraph />
        </div>
        <Card className="col-span-4 md:col-span-3">
          <CardHeader>
            <CardTitle>Recently Added</CardTitle>
            <CardDescription>You made 265 sales this month.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentlyAdded />
          </CardContent>
        </Card>
        <div className="col-span-4">
          <AreaGraph />
        </div>
        <div className="col-span-4 md:col-span-3">
          <PieGraph />
        </div>
      </div>
    </div>
  );
}

export default MainPage;
