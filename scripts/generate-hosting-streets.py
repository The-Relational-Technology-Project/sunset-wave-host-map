"""Generate a reviewed, local catalog from the SF Public Works active street snapshot.
Existing Avenue/coastal/south-Sloat IDs and coordinates are never regenerated.
Run with a downloaded JSON snapshot argument; no host data is used.
"""
import json, math, re, sys
from pathlib import Path
rows=json.loads(Path(sys.argv[1]).read_text())
# Core campaign polygon: Lincoln/19th, ocean frontage, Sloat frontage, Sloat/19th.
# Street/endpoints allowlists below narrow this envelope to the actual eligible grid.
polygon=[[-122.4770,37.7660],[-122.5120,37.7660],[-122.5120,37.7330],[-122.4755,37.7330]]
names=['LINCOLN','IRVING','JUDAH','KIRKHAM','LAWTON','MORAGA','NORIEGA','ORTEGA','PACHECO','QUINTARA','RIVERA','SANTIAGO','TARAVAL','ULLOA','VICENTE','WAWONA','SLOAT']
def inside(p):
 x,y=p; result=False
 for i,a in enumerate(polygon):
  b=polygon[(i+1)%len(polygon)]
  if (a[1]>y)!=(b[1]>y) and x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]: result=not result
 return result

def endpoint(s):
 m=re.fullmatch(r'(\d+)(?:ST|ND|RD|TH) AVE',s)
 if m and 19<=int(m[1])<=48: return s.title().replace('Ave','Ave')
 return {'SUNSET BLVD':'Sunset Blvd','GREAT HWY':'Great Hwy','LA PLAYA':'La Playa'}.get(s)
def midpoint(coords):
 lengths=[math.hypot((b[0]-a[0])*math.cos(math.radians(a[1])),b[1]-a[1]) for a,b in zip(coords,coords[1:])]
 target=sum(lengths)/2
 for a,b,d in zip(coords,coords[1:],lengths):
  if target<=d and d: return [round(a[1]+(b[1]-a[1])*target/d,7),round(a[0]+(b[0]-a[0])*target/d,7)]
  target-=d
 return [coords[0][1],coords[0][0]]
segments=[];corners={}
for r in rows:
 if r.get('street') not in names or r.get('layer')!='STREETS' or not r.get('active'):continue
 a,b=endpoint(r.get('f_st','')),endpoint(r.get('t_st',''))
 coords=r.get('line',{}).get('coordinates',[])
 if not a or not b or not coords or not all(inside(p) for p in coords):continue
 # Only neighboring numbered avenues, or source-confirmed frontage/Sunset Blvd pieces.
 nums=[int(m.group(1)) for s in (a,b) if (m:=re.match(r'(\d+)',s))]
 if len(nums)==2 and abs(nums[0]-nums[1])!=1:continue
 street=r['street'].title()
 segments.append({'id':'ew-'+r['cnn'],'street':street,'from':a,'to':b,'position':midpoint(coords),'cnn':r['cnn'],'nodes':[r.get('f_node_cnn'),r.get('t_node_cnn')],'geometry':coords})
 for label,p,node in [(a,coords[0],r.get('f_node_cnn')),(b,coords[-1],r.get('t_node_cnn'))]:
  if re.match(r'\d',label):
   cid='corner-'+str(node).split('.')[0]
   corners[cid]={'id':cid,'street':street,'from':label,'to':'','position':[round(p[1],7),round(p[0],7)],'cnn':r['cnn'],'nodes':[node],'geometry':[p]}
data={'source':'https://data.sf.gov/resource/3psu-pn9h.json','snapshot':max(r.get('data_as_of','') for r in rows),'polygon':polygon,'segments':segments,'corners':list(corners.values())}
Path('src/lib/hosting-streets.json').write_text(json.dumps(data,separators=(',',':'))+'\n')
print('Generated',len(segments),'east-west segments and',len(corners),'corners')
