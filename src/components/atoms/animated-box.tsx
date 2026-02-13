import { Button } from '@base-ui/react';
import { SquareAltArrowDown } from '@solar-icons/react';
import { motion } from 'motion/react';
import { useState } from 'react';

type Props = {
  children?: React.ReactNode;
  title?: string;
  openHeight?: string;
  closedHeight?: string;
};

export default function AnimatedBox({
  children,
  title,
  openHeight,
  closedHeight,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(true);

  console.log({ isExpanded });

  return (
    <motion.div
      initial={{ height: '10vh' }}
      animate={{
        height: isExpanded ? openHeight || '20vh' : closedHeight || '20vh',
      }}
      className="my-1 px-3 py-2 mx-3 gap-4 border border-dotted border-neutral-900 flex flex-col"
    >
      <div className="flex items-center justify-between">
        <h1 className="font-medium text-sm text-neutral-400">{title}</h1>
        <Button
          className="text-neutral-500"
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          <SquareAltArrowDown weight="Bold" />
        </Button>
      </div>
      <motion.div
        initial={{ opacity: 1, display: 'block' }}
        animate={{
          opacity: isExpanded ? 1 : 0,
          display: isExpanded ? 'block' : 'none',
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
