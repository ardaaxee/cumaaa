import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {expect,it} from 'vitest';
import {TeacherText} from '../src/components/TeacherText';
it('formats teaching sections and lists without executing response markup',()=>{
 const html=renderToStaticMarkup(createElement(TeacherText,{text:'### Kavram\n**Elektron** alışverişi\n* Anot\n* Katot\n1. Hesapla\n2. Kontrol et\n<script>alert(1)</script>'}));
 expect(html).toContain('<h3>Kavram</h3>');expect(html).toContain('<strong>Elektron</strong>');expect(html).toContain('<ul>');expect(html).toContain('<ol>');expect(html).not.toContain('<script>');expect(html).toContain('&lt;script&gt;');
});
