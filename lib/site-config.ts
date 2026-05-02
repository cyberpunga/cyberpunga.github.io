export const siteConfig = {
  name: "cyberpunga",
  description: "si estás leyendo esto, significa que sigues con vida y nos alegra muchísimo.",
  url: "https://cyberpun.ga", // Replace with your actual domain when you have one
  ogImage: "https://cyberpun.ga/og.jpg", // For social media previews
  links: {
    twitter: "https://x.com/cyberpunga", // Replace with actual social links if you have them
    github: "https://github.com/cyberpunga",
  },
  mainNav: [
    {
      title: "Artículos",
      href: "/posts",
    },
    // {
    //   title: "Acerca de",
    //   href: "/about",
    // },
  ],
  footerNav: {
    resources: [
      { title: "Inicio", href: "/" },
      { title: "Artículos", href: "/posts" },
      // { title: "Acerca de", href: "/about" },
    ],
    popularTags: [
      { title: "tecnología", href: "/posts?tag=tecnología" },
      { title: "sociedad", href: "/posts?tag=sociedad" },
      { title: "Latinoamérica", href: "/posts?tag=Latinoamérica" },
      { title: "IA", href: "/posts?tag=IA" },
    ],
  },
  writer: {
    repository: {
      owner: "cyberpunga",
      name: "cyberpunga.github.io",
      branch: "main",
    },
    token: {
      name: "cyberpunga writer",
      description: "Create and edit posts for cyberpunga.github.io",
      expiresInDays: 90,
      requiredPermissions: {
        contents: "write",
      },
    },
    storage: {
      tokenKey: "cyberpunga:github-token",
      draftKey: "cyberpunga:writer-draft",
    },
  },
};

export type SiteConfig = typeof siteConfig;
