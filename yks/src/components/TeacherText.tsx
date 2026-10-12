import {Fragment,type ReactNode} from 'react';
function inline(text:string):ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part,i)=>part.startsWith('**')&&part.endsWith('**')?<strong key={i}>{part.slice(2,-2)}</strong>:<Fragment key={i}>{part}</Fragment>);
}
/** Limited text formatting; response text is never interpreted as HTML. */
export function TeacherText({text}:{text:string}) {
  const lines=text.split('\n');const blocks:ReactNode[]=[];
  for(let i=0;i<lines.length;i++){
    const line=lines[i].trim();if(!line)continue;
    const heading=line.match(/^#{1,6}\s+(.+)$/);
    if(heading){blocks.push(<h3 key={i}>{inline(heading[1])}</h3>);continue;}
    if(/^[-*_]{3,}$/.test(line)){blocks.push(<hr key={i}/>);continue;}
    const ordered=/^\d+[.)]\s+/.test(line);const bullet=/^[-*•]\s+/.test(line);
    if(ordered||bullet){const start=i;const entries:ReactNode[]=[];const pattern=ordered?/^\d+[.)]\s+/:/^[-*•]\s+/;
      while(i<lines.length&&pattern.test(lines[i].trim())){entries.push(<li key={i}>{inline(lines[i].trim().replace(pattern,''))}</li>);i++;}i--;
      blocks.push(ordered?<ol key={start}>{entries}</ol>:<ul key={start}>{entries}</ul>);continue;
    }
    blocks.push(<p key={i}>{inline(line)}</p>);
  }
  return <div className="teacher-response-text">{blocks}</div>;
}
