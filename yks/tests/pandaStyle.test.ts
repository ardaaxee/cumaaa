import {expect,it} from 'vitest';
import {equipPandaStyle} from '../src/utils/pandaStyle';
it('replaces an outfit while keeping makeup and unlocked accessories',()=>{
 expect(equipPandaStyle(['gozluk','makyaj-pembe','kiyafet-pembe'],'kiyafet-mavi','outfit')).toEqual(['gozluk','makyaj-pembe','kiyafet-mavi']);
 expect(equipPandaStyle(['kiyafet-mavi','makyaj-pembe'],'','makeup')).toEqual(['kiyafet-mavi']);
});
