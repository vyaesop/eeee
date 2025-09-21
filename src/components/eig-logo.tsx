export const EIGLogo = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 160 90"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient
          id="gold-gradient"
          cx="50%"
          cy="50%"
          r="50%"
          fx="50%"
          fy="50%"
        >
          <stop offset="0%" style={{ stopColor: "#FDE047", stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: "#A16207", stopOpacity: 1 }}
          />
        </radialGradient>
      </defs>
      <circle cx="80" cy="20" r="18" fill="url(#gold-gradient)" />
      <text
        x="50%"
        y="80"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="70"
        fontWeight="bold"
        fill="#b91c1c"
        fontFamily="Arial, sans-serif"
      >
        EIG
      </text>
    </svg>
  );
};
