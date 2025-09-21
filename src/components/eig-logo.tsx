import Image from 'next/image';

export const EIGLogo = ({ className }: { className?: string }) => {
  return <Image src="/logo.png" alt="EIG Logo" width={64} height={64} className={className} />;
};
