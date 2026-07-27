import { useEffect } from "react";

const AdminPanel = () => {
  useEffect(() => {
    window.location.replace("/admin/");
  }, []);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4 text-foreground">
      <p className="text-sm font-medium text-muted-foreground">
        Opening the secure admin…
      </p>
    </div>
  );
};

export default AdminPanel;
