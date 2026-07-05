import React, { useEffect, useState } from 'react';

type AsTag = keyof JSX.IntrinsicElements;

export default function LazyMotion({ as = 'div', children, ...props }: { as?: AsTag; children?: React.ReactNode; [k: string]: any }) {
  const [Motion, setMotion] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    import('framer-motion')
      .then((mod) => {
        try {
          const motionExport = (mod && (mod.motion ?? mod.default ?? mod)) as any;
          let MotionComp;
          
          if (motionExport && typeof motionExport.create === 'function') {
            MotionComp = motionExport.create(as);
          } else if (motionExport && motionExport[as]) {
            MotionComp = motionExport[as];
          } else {
            MotionComp = motionExport;
          }
          
          if (mounted && MotionComp) setMotion(() => MotionComp);
        } catch (e) {
          // fallback
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [as]);

  const ElementTag = as as any;

  if (Motion) {
    return <Motion {...props}>{children}</Motion>;
  }

  // strip animation props so native element doesn't warn
  const { animate, initial, transition, whileHover, whileTap, whileInView, ...nativeProps } = props;
  return React.createElement(ElementTag, nativeProps, children);
}
