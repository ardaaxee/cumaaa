import type {HouseRoom} from './pandaLife';
export type PandaPose='standing'|'lying'|'seated';
/** Furniture poses belong to their room; walking never snaps onto furniture. */
export function pandaPose(room:HouseRoom,activity:string):PandaPose{
 if(room==='bedroom'&&activity==='sleeping')return 'lying';
 if(room==='kitchen'&&['waiting','eating','drinking'].includes(activity))return 'seated';
 return 'standing';
}
