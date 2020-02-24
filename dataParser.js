const fs = require('fs');

const githubUser = 'tim-ings';

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

const linkHref = {
    github: (proj) => `https://github.com/${githubUser}/${proj.slug}`,
    download: (proj) => `https://github.com/${githubUser}/${proj.slug}/releases`,
    web: (proj) => proj.demoUrl || "javascript:alert('Error: no demoUrl found')",
    curse: (proj) => proj.curseUrl || "javascript:alert('Error: no curseUrl found')",
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
            header: `img/headers/${proj.slug}.png`,
            categories: proj.categories.join(),
            links,
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
    const projectData = JSON.parse(fs.readFileSync('./src/data/projects.json', 'utf8'));
    return {
        data: {
            projects: processProjects(projectData), // require caches so use fs
            categories: processCategories(processProjects(projectData))
        }
    }
}

module.exports = getData;