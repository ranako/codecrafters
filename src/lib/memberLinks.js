const networks = [
  ['github', 'GitHub', 'github.com'],
  ['behance', 'Behance', 'behance.net'],
  ['linkedin', 'LinkedIn', 'linkedin.com'],
];

export function memberLinks(member) {
  return networks.flatMap(([network, label, host]) => {
    try {
      const url = new URL(member[network]);
      if (url.protocol !== 'https:' || url.username || url.password ||
          (url.hostname !== host && !url.hostname.endsWith(`.${host}`))) return [];
      return [{ network, label, href: url.href }];
    } catch { return []; }
  });
}
