import { useRef, useState } from 'react';
import { FaUpload, FaPlus, FaArrowUp, FaArrowDown, FaTrash, FaImage } from 'react-icons/fa';
import ImageControls from './ImageControls';
import { uploadImageFile } from '../lib/storageApi';
import { appendAlbumPhotos, reorderAlbumPhoto } from '../lib/adminContentUtils';
import { replaceAlbumPhoto, removeAlbumPhoto } from '../lib/imageDisplay';
import './AlbumPhotoManager.css';

function PhotoThumbnail({ src, index }) {
  const [failed, setFailed] = useState(false);
  return failed ? <span className="album-photo-missing" role="img" aria-label={`Photo ${index + 1} unavailable`}>Image unavailable</span> : <img draggable={false} src={src} alt={`Photo ${index + 1}`} loading="lazy" onError={() => setFailed(true)} />;
}

export default function AlbumPhotoManager({ album, onChange, disabled, onBusyChange, onError }) {
  const [selected, setSelected] = useState(0);
  const [urls, setUrls] = useState('');
  const [progress, setProgress] = useState(null);
  const [notice, setNotice] = useState('');
  const locked = useRef(false);
  const dragged = useRef(null);
  const photos = album.photos || [];
  const active = Math.min(selected, Math.max(0, photos.length - 1));
  const photo = photos[active];
  const busy = disabled || Boolean(progress);
  const change = next => { onChange(next); setNotice(''); };
  const upload = async (files, replace = null) => {
    if (disabled || locked.current) return;
    const list = Array.from(files || []);
    if (!list.length) return;
    if (list.some(file => !file.type.startsWith('image/'))) { onError('Choose image files only. Your album has not been changed.'); return; }
    locked.current = true; onBusyChange(true); onError(''); setNotice('');
    let current = album;
    let completed = 0;
    try {
      for (const file of list) {
        setProgress({ completed, total: list.length });
        const url = await uploadImageFile(file, { folder: 'album' });
        if (replace !== null) {
          current = replaceAlbumPhoto(current, replace, url);
          if (album.coverImage === album.photos[replace]) current.coverImage = url;
        } else current = appendAlbumPhotos(current, [url]);
        onChange(current);
        completed++;
      }
      setSelected(replace !== null ? replace : Math.max(0, current.photos.length - completed));
      setNotice(replace !== null ? 'Photo replaced in this draft. Save changes to update the website.' : `${completed} ${completed === 1 ? 'photo' : 'photos'} added to this draft. Save changes to update the website.`);
    } catch (error) {
      setNotice(`Upload stopped. ${completed} completed ${completed === 1 ? 'photo remains' : 'photos remain'} in this draft. Retry the remaining files.`);
      onError(`${error.message || 'Upload failed.'} ${completed ? `${completed} completed uploads remain in this draft. Retry the remaining files.` : 'Your existing photos are unchanged.'}`);
    } finally { locked.current = false; setProgress(null); onBusyChange(false); }
  };
  const addUrls = () => {
    try {
      const next = appendAlbumPhotos(album, urls.split(/\r?\n/));
      change(next); setUrls(''); setSelected(Math.min(photos.length, Math.max(0,next.photos.length-1)));
    } catch (error) { onError(error.message); }
  };
  const remove = () => {
    if (!window.confirm('Remove this photo from the album draft? The website changes only after saving.')) return;
    const next = removeAlbumPhoto(album, active);
    if (album.coverImage === photo) next.coverImage = next.photos[0] || '';
    change(next); setSelected(Math.max(0, active - 1));
  };
  return <div className="album-photo-manager">
    <div className="album-upload-zone" onDragOver={e => {e.preventDefault();e.stopPropagation();}} onDrop={e => {e.preventDefault();e.stopPropagation();upload(e.dataTransfer.files);}}>
      <FaImage aria-hidden="true" /><div><h4>Add photos to this album</h4><p>Select multiple images, or drop them here. The first photo becomes the cover if none is set.</p></div>
      <label className={`album-upload-button ${busy ? 'is-disabled' : ''}`}><FaUpload aria-hidden="true" />{progress ? `Uploading ${progress.completed + 1} of ${progress.total}` : 'Choose photos'}<input aria-label="Upload album photos" type="file" accept="image/*" multiple disabled={busy} onChange={e => {upload(e.target.files);e.target.value='';}} /></label>
    </div>
    {progress && <progress aria-label="Album upload progress" value={progress.completed} max={progress.total} />}
    {notice && <p role="status" className="album-photo-notice">{notice}</p>}
    <details className="album-url-entry"><summary>Add photos using image URLs</summary><label>Photo URLs (one per line)<textarea value={urls} disabled={busy} onChange={e=>setUrls(e.target.value)} rows={3} placeholder="https://example.com/photo.jpg" /></label><button type="button" disabled={busy || !urls.trim()} onClick={addUrls}><FaPlus aria-hidden="true" /> Add photo URLs</button></details>
    <div className="album-photo-summary"><h4>{photos.length} {photos.length === 1 ? 'photo' : 'photos'}</h4><span>Select a photo to edit its caption, framing or order.</span></div>
    {!photos.length && <p className="album-photo-empty">No photos yet. You can save an empty draft and add your photos later.</p>}
    <div className="album-photo-grid">{photos.map((url, index) => <button type="button" key={`${url}-${index}`} disabled={busy} aria-pressed={active===index} draggable={!busy} onDragStart={e=>{e.stopPropagation();dragged.current=index;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',String(index));}} onDragOver={e=>{e.preventDefault();e.stopPropagation();}} onDrop={e=>{e.preventDefault();e.stopPropagation();if(e.dataTransfer.files.length){upload([e.dataTransfer.files[0]],index);return;}if(!busy && dragged.current!==null){change(reorderAlbumPhoto(album,dragged.current,index));setSelected(index);}dragged.current=null;}} onDragEnd={()=>{dragged.current=null;}} aria-label={`Edit photo ${index+1}`} onClick={()=>setSelected(index)}><PhotoThumbnail src={url} index={index} /><span>{index+1}{album.coverImage === url ? ' · Cover' : ''}</span></button>)}</div>
    {photo !== undefined && <fieldset disabled={busy} className="album-selected-photo"><legend>Photo {active+1}</legend>
      <div className="album-photo-actions"><button type="button" disabled={busy || active===0} onClick={()=>{change(reorderAlbumPhoto(album,active,active-1));setSelected(active-1);}}><FaArrowUp aria-hidden="true" />Earlier</button><button type="button" disabled={busy || active===photos.length-1} onClick={()=>{change(reorderAlbumPhoto(album,active,active+1));setSelected(active+1);}}><FaArrowDown aria-hidden="true" />Later</button><button type="button" disabled={busy || album.coverImage===photo} onClick={()=>change({...album,coverImage:photo})}>Use as cover</button><label className="album-replace-button">Replace photo<input aria-label="Replace selected photo" type="file" accept="image/*" disabled={busy} onChange={e=>{upload(e.target.files,active);e.target.value='';}} /></label><button type="button" disabled={busy} onClick={remove}><FaTrash aria-hidden="true" />Remove</button></div>
      <label>Photo URL<input value={photo} onChange={e=>{try{const next=replaceAlbumPhoto(album,active,e.target.value);if(album.coverImage===photo)next.coverImage=e.target.value;change(next);}catch(error){onError(error.message);}}} /></label>
      <label>Photo caption (searchable)<input value={album.photo_captions?.[photo] || ''} onChange={e=>change({...album,photo_captions:{...album.photo_captions,[photo]:e.target.value}})} /></label>
      <details><summary>Image framing and display</summary><ImageControls src={photo} value={album.photo_display?.[photo]} onChange={value=>change({...album,photo_display:{...album.photo_display,[photo]:value}})} placements={['photoGrid','photoReel','photoViewer']} disabled={busy} /></details>
    </fieldset>}
  </div>;
}
