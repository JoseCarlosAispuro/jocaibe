import contactData from "@/app/data/contact.json";

const Footer = () => {
    return(
        <footer className="py-8">
            <div className="container mx-auto px-(--gutter) flex justify-between flex-wrap gap-4 items-center">
                <span className="mono">{contactData.footer}</span>
                <span className="mono">{contactData.footerStack}</span>
            </div>
        </footer>
    )
}

export default Footer
