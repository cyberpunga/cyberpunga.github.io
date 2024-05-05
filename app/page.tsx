export default function Page() {
  return (
    <section className="flex-auto grid place-items-center">
      <h1
        data-text={"si estás leyendo esto, significa que sigues con vida y nos alegra muchísimo."}
        className="relative before:absolute before:content-[attr(data-text)] before:top-0 before:left-0 before:blur"
      >
        si estás leyendo esto, significa que sigues con vida y nos alegra muchísimo.
      </h1>
    </section>
  );
}
