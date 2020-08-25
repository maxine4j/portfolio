const fs = require('fs');

const projectsFile = './src/data/projects.json';
const githubUser = 'tim-ings';

const headerImgFormatter = (slug) => `img/headers/${slug.toLowerCase()}.png`;

const linkIcons = {
    github: "github",
    download: "download",
    web: "live",
    curse: "curse",
}

const linkText = {
    github: "GitHub",
    download: "Download",
    web: "Live Demo",
    curse: "View on Curse",
}

const errorFatal = (msg) => {
    console.error(`\x1b[31m${msg}\x1b[0m`);
    process.exit(1);
}

const linkHref = {
    github: (proj) => `https://github.com/${proj.githubUser || githubUser}/${proj.slug}`,
    download: (proj) => `https://github.com/${githubUser}/${proj.slug}/releases`,
    web: (proj) => proj.demoUrl || errorFatal(`ERROR: No demoUrl for ${proj.slug}`),
    curse: (proj) => proj.curseUrl || errorFatal(`ERROR: No curseUrl for ${proj.slug}`),
}

const processProjects = (projects) => {
    return projects.map(proj => {
        const links = proj.links.map(link => {
            return {
                icon: linkIcons[link],
                text: linkText[link],
                href: linkHref[link](proj),
            }
        });
        return {
            name: proj.name,
            slug: proj.slug,
            description: proj.description,
            header: headerImgFormatter(proj.slug),
            categories: proj.categories.join(),
            links,
            tech: proj.tech,
            downloads: proj.downloads,
            iframe: proj.iframe,
        }
    });
}

const processCategories = (projects) => {
    return {
        all: projects,
        featured: projects.filter(p => p.categories.includes('featured')),
        websites: projects.filter(p => p.categories.includes('website')),
        programs: projects.filter(p => p.categories.includes('program')),
        games: projects.filter(p => p.categories.includes('game')),
        addons: projects.filter(p => p.categories.includes('addon')),
    };
}

const getData = () => {
    const projectData = JSON.parse(fs.readFileSync(projectsFile, 'utf8')); // require caches so use fs
    return {
        data: {
            projects: processProjects(projectData),
            categories: processCategories(processProjects(projectData))
        }
    }
}

module.exports = getData;
