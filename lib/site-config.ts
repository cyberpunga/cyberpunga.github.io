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
};

export type SiteConfig = typeof siteConfig;
