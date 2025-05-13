// the type does not export
export function generateAvContent(value: any[]) {
	const videos = value
		.filter((e) => e.type === 'video')
		.map((e) => {
			return `<video controls width="100%">
        <source src="${e.url}" type="video/mp4" />
      </video>`;
		})
		.join('');

	const audios = value
		.filter((e) => e.type === 'audio')
		.map((e) => {
			return `<audio controls>
      <source src="${e.url}" type="audio/mpeg" />
    </audio>`;
		})
		.join('');
	return videos + audios;
}
