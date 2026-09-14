import traditionalImg from "../assets/banner_1.jpeg";
import modernImg from "../assets/banner_2.jpeg";
import traditionalEthnicImg from "../assets/traditional_ethnic_wear.png";
import modernEthnicImg from "../assets/modern_ethnic_fusion.png";

export const heroSlides = [
  {
    img: traditionalImg,
    tag: "atelier edit",
    title: "handcrafted elegance.",
    desc: "Timeless Indian silhouettes shaped with quiet detail, soft structure, and occasion-ready craft.",
    cta: "shop collection",
  },
  {
    img: modernImg,
    tag: "made for now",
    title: "bespoke styling.",
    desc: "Custom-finished outfits for the modern woman, tailored for comfort, confidence, and celebration.",
    cta: "explore catalog",
  },
  {
    img: modernEthnicImg,
    tag: "new arrivals",
    title: "everyday classics.",
    desc: "Breathable fabrics, graceful embroidery, and versatile sets designed for repeat wear.",
    cta: "shop now",
  },
];

export const collections = [
  {
    title: "Stylish Kurtis",
    eyebrow: "daily coordinate styling",
    desc: "Artisanal tunics for polished everyday dressing.",
    to: "/products/Kurti",
    img: modernEthnicImg,
  },
  {
    title: "Designer Suits",
    eyebrow: "handcrafted luxury",
    desc: "Layered sets with festive ease and refined finishing.",
    to: "/products/Suit",
    img: traditionalImg,
  },
  {
    title: "Wedding Collection",
    eyebrow: "occasion couture",
    desc: "Statement silhouettes for ceremonies and celebrations.",
    to: "/products/wedding",
    img: traditionalEthnicImg,
  },
  {
    title: "Winter Ethnic Wear",
    eyebrow: "soft seasonal layers",
    desc: "Warm, graceful pieces for elegant cold-weather dressing.",
    to: "/products/EthnicWear",
    img: modernImg,
  },
  {
    title: "Elegant Coat Sets",
    eyebrow: "tailored outerwear",
    desc: "Structured ethnic layers with a contemporary boutique finish.",
    to: "/products/Coat",
    img: traditionalEthnicImg,
  },
];

export const categoryMeta = {
  kurti: {
    category: "kurti",
    eyebrow: "signature edit",
    title: "kurti collection",
    desc: "Fluid silhouettes, modern embroidery, and everyday luxury tailored for you.",
    fallbackCategory: "Kurti",
    image: modernEthnicImg,
  },
  suit: {
    category: "suit",
    eyebrow: "suit atelier",
    title: "suit collection",
    desc: "Fluid layers, rich embroideries, and statement silhouettes made for celebrations.",
    fallbackCategory: "Suit",
    image: traditionalImg,
  },
  coat: {
    category: "coat",
    eyebrow: "tailored layers",
    title: "coat sets",
    desc: "Structured ethnic wear with warm textures, precise cuts, and graceful movement.",
    fallbackCategory: "Coat",
    image: traditionalEthnicImg,
  },
  ethnicWear: {
    category: "ethnicWear",
    eyebrow: "winter edit",
    title: "winter ethnic wear",
    desc: "Soft seasonal layers, heritage details, and comfort-first festive dressing.",
    fallbackCategory: "Winter Ethnic Wear",
    image: modernImg,
  },
  wedding: {
    category: "wedding",
    eyebrow: "occasion couture",
    title: "wedding collection",
    desc: "Ceremonial sets, rich craft, and made-to-measure silhouettes for memorable days.",
    fallbackCategory: "Wedding Collection",
    image: traditionalEthnicImg,
  },
};
