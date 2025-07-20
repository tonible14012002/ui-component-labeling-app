import { PropsWithChildren } from "react";

export const AppLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex h-[100vh] w-full">
      {/* FIXME: Sidebar here */}
      <div className="flex-1 flex flex-col w-full overflow-x-hidden">
      {/* FIXME: Header here */}
        <div className="flex flex-col flex-1 overflow-y-auto w-full">{children}</div>
      </div>
    </div>
  );
};
