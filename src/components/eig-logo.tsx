export const EIGLogo = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
    >
      <g strokeWidth="8">
        <rect width="100" height="100" rx="20" stroke="hsl(var(--primary))" fill="hsl(var(--background))" />
        <path d="M 25,75 L 50,25 L 75,75" stroke="hsl(var(--accent))" />
        <path d="M 35,60 L 65,60" stroke="hsl(var(--accent))" />
      </g>
    </svg>
  );
};
