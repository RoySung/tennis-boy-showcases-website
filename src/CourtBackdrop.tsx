import { assetUrl } from './assetUrl';
import usePageVisibility from './usePageVisibility';
import { WORLD_SCROLL_SECONDS } from './environment';

type CourtBackdropProps = {
  motion?: boolean;
  moving?: boolean;
  active?: boolean;
  speed?: number;
};

export default function CourtBackdrop({ motion = false, moving = false, active = true, speed = 1 }: CourtBackdropProps) {
  const visible = usePageVisibility();
  return <div className={`court-backdrop court-backdrop--v2${motion ? ' court-backdrop--motion' : ''}${moving && visible ? ' court-backdrop--moving' : ''}${active && visible ? ' court-backdrop--active' : ''}`}
    style={{ '--world-duration': `${WORLD_SCROLL_SECONDS / speed}s`, '--cloud-duration': `${75 / speed}s` } as React.CSSProperties} aria-hidden="true">
    <div className="court-sky"/>
    <div className="court-panorama">
      {[false, true, false, true].map((mirrored, index) =>
        <img key={index} className={mirrored ? 'court-panorama__mirror' : undefined}
          src={assetUrl('environment/tennis-center-backdrop-cloudless-v6.png')} alt="" draggable="false"/>
      )}
    </div>
    <div className="court-clouds">
      {[0, 1, 2, 3].map(index => <img key={index} src={assetUrl('environment/tennis-center-clouds-v2.png')} alt="" draggable="false"/>)}
    </div>
    <div className="court-atmosphere"/>
  </div>;
}
