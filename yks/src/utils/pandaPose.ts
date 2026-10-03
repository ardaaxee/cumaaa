import type {HouseRoom} from './pandaLife';
export type PandaPose='standing'|'lying'|'seated'|'sofa'|'desk'|'bath'|'terrace'|'watering';
/** Furniture poses belong to their room; walking never snaps onto furniture. */
export function pandaPose(room:HouseRoom,activity:string):PandaPose{
 if(room==='bedroom'&&activity==='sleeping')return 'lying';
 if(room==='kitchen'&&['waiting','eating','drinking'].includes(activity))return 'seated';
 if(room==='living'&&activity==='relaxing')return 'sofa';
 if(room==='study'&&activity==='studying')return 'desk';
 if(room==='bathroom'&&activity==='bathing')return 'bath';
 if(room==='balcony'&&activity==='relaxing')return 'terrace';
 if(room==='garden'&&activity==='relaxing')return 'watering';
 return 'standing';
}
