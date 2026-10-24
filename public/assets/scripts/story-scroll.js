/* Chapters follow the browser's native scroll; no wheel or touch interception. */
window.CanopyStoryScroll = {
 mount({main}) {
  main.dataset.scrollMode='native';
  return ()=>{delete main.dataset.scrollMode;};
 }
};
