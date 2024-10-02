import { useParams } from 'react-router-dom';
import { cardData } from '@/lib/data';

import { Button } from '@/components/ui/button';

import StudentsDataTable from '@/components/students/data-table';
import GroupHeader from '@/components/groups/group-header';

const Group = () => {
  const { groupId } = useParams();

  const group = cardData.find((g) => g.id === parseInt(groupId));

  if (!group) {
    return (
      <div className="container mx-auto py-4">
        <h2 className="text-2xl font-bold tracking-tight">404 error</h2>
        <p className="text-muted-foreground">
          Siz qidirayotgan guruh topilmadi!
        </p>
      </div>
    );
  }

  return (
    <>
      <GroupHeader group={group} />

      <div className="container mx-auto space-y-2">
        <StudentsDataTable>
          <Button>O'quvchi qo'shish</Button>
        </StudentsDataTable>
      </div>
    </>
  );
};

export default Group;