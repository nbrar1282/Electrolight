export default function AboutSection() {
  return (
    <section id="about" className="py-16 bg-white dark:bg-gray-800">
      <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">About ElectroLight</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              With over 20 years of experience in the electrical industry, ElectroLight has been a trusted partner for contractors, electricians, and homeowners across the region.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We specialize in providing high-quality electrical products ranging from basic components to advanced smart home solutions. Our commitment to quality and customer service has made us a leader in the electrical supply industry.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">5000+</div>
                <div className="text-gray-600 dark:text-gray-300">Products</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">20+</div>
                <div className="text-gray-600 dark:text-gray-300">Years Experience</div>
              </div>
            </div>
          </div>
          <div>
            <img 
              src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
              alt="ElectroLight Warehouse" 
              className="rounded-lg shadow-lg w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
