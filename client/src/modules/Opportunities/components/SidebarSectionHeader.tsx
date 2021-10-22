type Props = {
  title: string;
};

export function SidebarSectionHeader({ title }: Props) {
  return (
    <>
      <div style={{ fontSize: 14, paddingBottom: 16 }}>
        <span className="header">{title}</span>
      </div>
      <style jsx>{`
        .header {
          color: #000;
          text-transform: uppercase;
          background-color: rgb(255, 236, 61);
          padding: 0 8px 0 8px;
          font-weight: bold;
          display: inline-block;
        }
      `}</style>
    </>
  );
}
