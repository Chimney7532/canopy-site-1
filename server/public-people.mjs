// Public directory supplied for this edition. These entries are not login accounts.
const member = (id, name, group = 'community', photo_url = '') => ({
 id, name, group, photo_url, public_profile: 1, identities: [], bio: ''
});
export const publicPeople = [
 member('chimney-y', 'Chimney Y.'),
 member('sophia-l', 'Sophia L.'),
 member('shardul-m', 'Shardul M.', 'community', '/assets/images/people-shardul.jpg'),
 member('yuanxin-m', 'Yuanxin M.'),
 member('david-z', 'David Z.'),
 member('cathy-c', 'Cathy C.'),
 member('tom-y', 'Tom Y.'),
 member('helena-w', 'Helena W.'),
 member('jane-y', 'Jane Y.'),
 member('canyon-l', 'Canyon L.', 'founding', '/assets/images/people-canyon.jpg'),
 member('zephyr-d', 'Zephyr D.', 'founding'),
 member('qi-j', 'Qi J.', 'founding', '/assets/images/people-qi.jpg'),
 member('roderick-d', 'Roderick D.', 'advisors'),
];
