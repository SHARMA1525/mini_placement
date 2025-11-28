const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

const createCompanyifnotExists = async (companyData) => {
  const { email, companyName } = companyData;
  const alreadyExists = await prisma.companies.findFirst({
    where: { OR: [{ email }, { companyName }] }
  });


  if (alreadyExists) {
    throw new Error('Company with this email or company name already exists');
  }
  const hashedPassword = await bcrypt.hash(companyData.password, 10);

  const newCompany = await prisma.companies.create({
    data: {
      companyName: companyData.companyName,
      email: companyData.email,
      password: hashedPassword,
      address: companyData.address,
      phone: companyData.phone,
      website: companyData.website,
      description: companyData.description
    }
  });

  return newCompany;
}


const existingCompany = async (email) => {
  const company = await prisma.companies.findFirst({
    where: { email: email }
  });

  if (!company) {
    throw new Error('Invalid company name or email');
  }
  return company;
}


const createJobIfNotExists = async (jobData) => {
  const alreadyActive = await prisma.jobs.findFirst({
    where: {
      companyId: jobData.companyId,
      jobTitle: jobData.jobTitle,
      isActive: true
    }
  })
  if (alreadyActive) {
    throw new Error('An active job with this title already exists for the company');
  }
  const newJob = await prisma.jobs.create({
    data: {
      companyId: jobData.companyId,
      jobTitle: jobData.jobTitle,
      isActive: true,
      stipend: jobData.stipend,
      description: jobData.description,
      skills: {
        connectOrCreate: jobData.skills.map(skill => ({
          where: { skillName: skill },
          create: { skillName: skill }
        }))
      }
    },
    include: { skills: true }
  })
  return newJob;

}

const updateCompany = async (email, updateData) => {

  const updatedCompany = await prisma.companies.update({
    where: { email: email },
    data: updateData,
  });

  return updatedCompany;
};

module.exports = { createCompanyifnotExists, existingCompany, createJobIfNotExists, updateCompany };