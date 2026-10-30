#!/usr/bin/env python3
import sys, json, base64, re, os, tempfile
from datetime import datetime
import pymupdf as fitz


def clean(s):
    value = re.sub(r'\s+', ' ', str(s or '').replace('\xa0',' ')).strip()
    return value.replace('চট্টগ্রাাম', 'চট্টগ্রাম').replace('পল্লীী', 'পল্লী')


def norm_bn(s):
    s = clean(s)
    # Repair known duplicated glyphs in this PDF's embedded text layer.
    return s.replace('চট্টগ্রাাম', 'চট্টগ্রাম').replace('পল্লীী', 'পল্লী')


def lines_from_pdf(doc):
    """Extract selectable PDF text; use Tesseract OCR only for image-only pages.

    OCR is a fallback so normal text PDFs keep the existing extraction path.
    If OCR or Bengali language data is unavailable, extraction safely falls back
    to whatever selectable text the PDF contains.
    """
    out=[]
    for page in doc:
        txt=page.get_text('text') or ''
        if not txt.strip():
            try:
                tp=page.get_textpage_ocr(language='ben+eng', dpi=300, full=True)
                txt=page.get_text('text', textpage=tp) or ''
            except Exception:
                try:
                    tp=page.get_textpage_ocr(language='eng', dpi=300, full=True)
                    txt=page.get_text('text', textpage=tp) or ''
                except Exception:
                    txt=''
        for line in txt.splitlines():
            v=line.strip()
            if v:
                out.append(v)
    return out


def val_after(lines, label, stop_labels=()):
    low=label.lower()
    for i,x in enumerate(lines):
        if clean(x).lower()==low:
            for y in lines[i+1:]:
                z=clean(y)
                if not z: continue
                if z.lower() in {s.lower() for s in stop_labels}:
                    return ''
                return z
    return ''


def address_block(lines, start_label='Permanent Address'):
    """Read this PDF's address as a sequence of label/value cells, not OCR text.

    Keep present and permanent sections isolated and retain literal source text.
    """
    names = {'present address', 'permanent address'}
    target_parts = clean(start_label).lower().split()
    start = None
    for i, x in enumerate(lines):
        if clean(x).lower() == clean(start_label).lower():
            start = i + 1
            break
        if [clean(v).lower() for v in lines[i:i+len(target_parts)]] == target_parts:
            start = i + len(target_parts)
            break
    if start is None:
        return {}
    end = next((i for i in range(start, len(lines)) if clean(lines[i]).lower() in
                names | {'education', 'education other', 'identification'}), len(lines))
    a = [clean(x) for x in lines[start:end] if clean(x)]
    # Sidebar labels can be interleaved with address table text by PDF reading order.
    sidebar_noise = {
        'citizen', 'license', 'license documents', 'documents', 'smart card info',
        'voter documents', 'no documents available', 'photo', 'signature',
        'birth_certificate', 'voter form', 'birth certificate', 'smart card info'
    }
    a = [x for x in a if x.lower() not in sidebar_noise]
    # PDF text extraction often splits multi-word labels and cell values onto
    # separate lines (for example: Post / Office / গোজরা / নোয়াপাড়া / Postal / Code).
    # Keep the split tokens as aliases so the value is not silently lost.
    labels = {
        ('Division',): 'division', ('District',): 'district', ('RMO',): 'rmo',
        ('Upozila',): 'upazila', ('Union/Ward',): 'unionWard',
        ('Mouza/Moholla',): 'mouza',
        ('Additional', 'Mouza/Moholla'): 'additionalMouza',
        ('Ward For', 'Union', 'Porishod'): 'ward',
        ('Ward For Union', 'Porishod'): 'ward',
        ('Village/Road',): 'village',
        ('Additional', 'Village/Road'): 'additionalVillage',
        ('Additional Village/Road',): 'additionalVillage',
        ('Home/Holding', 'No'): 'home', ('Home/Holding No',): 'home', ('Home/Holding',): 'home',
        ('Post Office',): 'post', ('Post', 'Office'): 'post',
        ('Postal Code',): 'postal', ('Postal', 'Code'): 'postal', ('Region',): 'region',
        ('City', 'Corporation /', 'Municipality'): 'cityMunicipality',
        ('City', 'Corporation', 'Or', 'Municipality'): 'cityMunicipality',
    }
    # In source PDFs 'Mouza/Moholla / Additional / Mouza/Moholla' means
    # the first label is blank and the second label carries the value.
    out = {v: '' for v in labels.values()}
    all_label_tokens={part for parts in labels for part in parts}
    all_label_tokens.update({'Additional Village/Road','Additional Mouza/Moholla','Ward For Union Porishod','Ward For Union','Home/Holding No','City Corporation Or Municipality'})
    i = 0
    while i < len(a):
        matched = None
        for parts, key in sorted(labels.items(), key=lambda t: -len(t[0])):
            if tuple(a[i:i+len(parts)]) == parts:
                matched = (parts, key)
                break
        if matched is None:
            i += 1
            continue
        parts, key = matched
        j = i + len(parts)
        next_is_label = any(tuple(a[j:j+len(label_parts)]) == label_parts for label_parts in labels)
        # Most cells contain one value token. Post Office and Home/Holding
        # are frequently wrapped over multiple lines in these PDFs, so join
        # only those values until the next recognized label.
        if key in ('post', 'home'):
            value_parts=[]
            k=j
            while k < len(a):
                is_next_label = any(tuple(a[k:k+len(label_parts)]) == label_parts for label_parts in labels)
                if is_next_label:
                    break
                token=a[k]
                if token.lower() not in sidebar_noise and token not in ('-', '—') and token not in all_label_tokens and not token.startswith('Additional Village/Road'):
                    value_parts.append(token)
                k += 1
            if value_parts:
                out[key] = ' '.join(value_parts).strip()
            i = max(k, j)
        elif j < len(a) and not next_is_label and a[j] not in ('-', '—') and a[j] not in all_label_tokens and not a[j].startswith('Additional Village/Road'):
            out[key] = a[j]
            i = j + 1
        else:
            i = j
    # Repair additional village label where PDF text extraction emits one token.
    for i, token in enumerate(a):
        if token == 'Additional Village/Road' and i+1<len(a):
            candidate=a[i+1]
            if candidate not in all_label_tokens and candidate not in ('-', '—'):
                out['additionalVillage']=candidate
    # Label 'Additional' may follow a blank base label; the PDF emits
    # 'Mouza/Moholla', 'Additional', 'Mouza/Moholla', value.
    return out


def format_address(a):
    """Format NID address in Bengali, retaining home/holding and source values.

    Order requested: home/holding, village/road, post office + postal code,
    upazila, district. Avoid duplicating village and mouza when they represent
    the same place in the source PDF.
    """
    if not a:
        return ''
    parts=[]
    home=clean(a.get('home'))
    if home and home not in ('-', '—'):
        parts.append('বাসা/হোল্ডিং: ' + home)

    village=clean(a.get('village'))
    additional_village=clean(a.get('additionalVillage'))
    mouza=clean(a.get('mouza'))
    additional_mouza=clean(a.get('additionalMouza'))
    # Prefer Village/Road. Use additional village or mouza only when needed;
    # don't repeat the same location just because the PDF table has two fields.
    village_values=[]
    # Village/Road is the requested address component. Use fallback fields only
    # when the source PDF has no Village/Road value; do not append Mouza twice.
    primary_village = village or additional_village
    if primary_village and primary_village not in ('-', '—'):
        village_values.append(primary_village)
    elif mouza and mouza not in ('-', '—'):
        village_values.append(mouza)
    elif additional_mouza and additional_mouza not in ('-', '—'):
        village_values.append(additional_mouza)
    if village_values:
        parts.append('গ্রাম/রাস্তা: ' + ', '.join(village_values))

    post=clean(a.get('post'))
    code=clean(a.get('postal')).translate(str.maketrans('0123456789','০১২৩৪৫৬৭৮৯'))
    if post:
        parts.append('ডাকঘর: '+post+(' - '+code if code else ''))
    elif code:
        parts.append('ডাকঘর: '+code)

    for key in ('upazila','district'):
        value=clean(a.get(key))
        if value and value not in ('-', '—'):
            parts.append(value)
    return ', '.join(parts)


def format_dob(value):
    """Normalize only valid dates; never guess a missing or ambiguous value."""
    v=clean(value).translate(str.maketrans('০১২৩৪৫৬৭৮৯','0123456789'))
    for pattern in ('%Y-%m-%d','%d/%m/%Y','%d-%m-%Y','%d.%m.%Y','%d %b %Y','%d %B %Y'):
        try:
            return datetime.strptime(v,pattern).strftime('%d %b %Y')
        except ValueError:
            pass
    return v

def extract_image_data(doc):
    """Render image rectangles as seen in the PDF, avoiding soft-mask corruption.

    A tall second image may be a fingerprint, NOT a signature. Never label it
    as a signature based on image ordering alone.
    """
    candidates=[]
    for page_no,page in enumerate(doc):
        for img in page.get_images(full=True):
            xref=img[0]
            for rect in page.get_image_rects(xref):
                if rect.width < 15 or rect.height < 15: continue
                ratio=rect.width/rect.height
                try:
                    pix=page.get_pixmap(matrix=fitz.Matrix(2.5,2.5),clip=rect,alpha=False)
                    encoded=base64.b64encode(pix.tobytes('png')).decode('ascii')
                except Exception as exc:
                    print('image render warning:',exc,file=sys.stderr)
                    continue
                candidates.append({'page':page_no,'rect':rect,'ratio':ratio,
                    'area':rect.width*rect.height,
                    'dataUrl':'data:image/png;base64,'+encoded})
    # Portrait photo: portrait-like ratio, prioritize top-right placement.
    photos=[c for c in candidates if .55 <= c['ratio'] <= 1.05 and c['area']>=1500]
    photos.sort(key=lambda c:(c['page'],c['rect'].y0,-c['area']))
    photo=photos[0] if photos else None
    # The second image beneath the ID portrait may be a signature OR a
    # fingerprint. V9 discarded tall fingerprints, leaving the preview empty.
    # Select by actual PDF placement first, then label by geometry.
    marks=[]
    if photo:
        pr=photo['rect']
        for c in candidates:
            if c is photo or c['page'] != photo['page'] or c['area'] < 450:
                continue
            r=c['rect']
            overlap=max(0,min(r.x1,pr.x1)-max(r.x0,pr.x0))
            horizontal_center_delta=abs((r.x0+r.x1)/2-(pr.x0+pr.x1)/2)
            # Signature/fingerprint is normally in the same right column below the portrait.
            if (r.y0 >= pr.y1-5 and r.y0 <= pr.y1+300
                    and (overlap >= min(r.width,pr.width)*0.35
                         or horizontal_center_delta <= max(pr.width,r.width)*0.35)):
                c['_mark_score']=(max(0,r.y0-pr.y1), horizontal_center_delta, -c['area'])
                marks.append(c)
    marks.sort(key=lambda c:c.get('_mark_score',(9999,9999,0)))
    mark=marks[0] if marks else None
    if mark:
        # Geometry is a best-effort layout hint. Tall images in the same column are fingerprints.
        mark['kind']='Signature' if mark['ratio']>=1.35 else 'Fingerprint'
    return photo, mark



def parse(doc):
    lines=lines_from_pdf(doc)
    raw='\n'.join(lines)
    d={
      'nameBn':'','nameEn':'','documentNumber':'','pinNumber':'','fatherName':'','motherName':'',
      'birthPlace':'','dob':'','bloodGroup':'','issueDate':'','address':'',
      'presentAddress':'','permanentAddress':'','voterArea':'','voteNo':'','formNo':'',
      'birthRegNo':'','education':'','spouseName':'','occupation':'','marital':'','gender':'',
      'religion':'','fatherDocumentNumber':'','motherDocumentNumber':'','spouseDocumentNumber':'','sINo':'','userIMG':'','signIMG':'','fingerIMG':'','markType':''
    }

    # PDF exports are label/value pairs, but some labels intentionally have
    # no value (e.g. Spouse Name). Never consume the next label as a value.
    field_labels={
      'Document Number','Pin','Status','Afis Status','Lock Flag','Voter No','Form No','Sl No','Tag',
      'Name(Bangla)','Name(English)','Date of Birth','Birth Place','Birth Other','Birth Registration','No',
      'Father Name','Mother Name','Spouse Name','Gender','Marital','Occupation','Disability','Disability Other',
      'Present Address','Permanent Address','Division','District','RMO','City','Corporation /','Municipality',
      'Upozila','Union/Ward','Mouza/Moholla','Additional','Ward For','Union','Porishod','Village/Road',
      'Home/Holding','Post Office','Postal Code','Region','Education','Education Other','Education Sub','Identification',
      'Issue Date','Blood Group','Religion','Religion Other','Voter Area','Father Document Number','Mother Document Number','Spouse Document Number','Voter No Father','Voter No Mother','Voter No Spouse','Mobile','Email'
    }
    def value_after(label, start=0):
        target=clean(label).lower()
        for i in range(start,len(lines)):
            if clean(lines[i]).lower()==target:
                for j in range(i+1,len(lines)):
                    z=clean(lines[j])
                    if not z: continue
                    if z.lower() in {x.lower() for x in field_labels}: return ''
                    return z
        return ''

    d['documentNumber']=value_after('Document Number')
    d['pinNumber']=value_after('Pin')
    d['nameBn']=norm_bn(value_after('Name(Bangla)'))
    d['nameEn']=value_after('Name(English)').upper()
    d['dob']=format_dob(value_after('Date of Birth'))
    d['birthPlace']=norm_bn(value_after('Birth Place'))
    # Birth Registration is split as: Birth Registration / No / value.
    for i,x in enumerate(lines):
        if clean(x).lower()=='birth registration':
            if i+2<len(lines) and clean(lines[i+1]).lower()=='no':
                d['birthRegNo']=clean(lines[i+2])
            break
    d['fatherName']=norm_bn(value_after('Father Name'))
    d['motherName']=norm_bn(value_after('Mother Name'))
    d['spouseName']=norm_bn(value_after('Spouse Name'))
    d['gender']=value_after('Gender')
    d['marital']=value_after('Marital')
    d['occupation']=norm_bn(value_after('Occupation'))
    d['education']=norm_bn(value_after('Education'))
    d['religion']=value_after('Religion')
    d['voterArea']=norm_bn(value_after('Voter Area'))
    d['voteNo']=value_after('Voter No')
    d['formNo']=value_after('Form No')
    d['sINo']=value_after('Sl No')
    d['fatherDocumentNumber']=value_after('Father Document Number')
    d['motherDocumentNumber']=value_after('Mother Document Number')
    d['spouseDocumentNumber']=value_after('Spouse Document Number')
    d['bloodGroup']=value_after('Blood Group')
    # Preserve the issue date printed on the source NID PDF. Do not substitute today's date.
    d['issueDate']=format_dob(value_after('Issue Date'))
    d['mobile']=value_after('Mobile')

    perm=address_block(lines,'Permanent Address')
    pres=address_block(lines,'Present Address')
    d['permanentAddressFields']=perm
    d['presentAddressFields']=pres
    d['permanentAddress']=format_address(perm)
    d['presentAddress']=format_address(pres)
    d['address']=d['permanentAddress'] or d['presentAddress']

    # Keep a real blood-group value only; never infer it from unrelated text.
    if d['bloodGroup']:
        m=re.search(r'\b(A|B|AB|O)\s*([+-])\b',d['bloodGroup'],re.I)
        d['bloodGroup']=(m.group(1)+m.group(2)).upper() if m else ''

    photo,sign=extract_image_data(doc)
    if photo: d['userIMG']=photo['dataUrl']
    if sign:
        if sign['kind'] == 'Fingerprint':
            d['fingerIMG']=sign['dataUrl']
            d['markType']='fingerprint'
        else:
            d['signIMG']=sign['dataUrl']
            d['markType']='signature'
    return d


def main():
    if len(sys.argv)<2: raise SystemExit('missing pdf')
    path=sys.argv[1]
    doc=fitz.open(path)
    try:
        result=parse(doc)
        print(json.dumps(result,ensure_ascii=False))
    finally:
        doc.close()

if __name__=='__main__': main()
