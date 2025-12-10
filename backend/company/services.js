const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

const createCompanyifnotExists = async (companyData) => {
  const { email, companyName } = companyData;

  const alreadyExists = await prisma.companies.findFirst({
    where: { OR: [{ email }, { companyName }] },
  });

  if (alreadyExists) {
    throw new Error("Company with this email or company name already exists");
  }

  const hashedPassword = await bcrypt.hash(companyData.password, 10);

  const newCompany = await prisma.companies.create({
    data: {
      companyName: companyData.companyName,
      email: companyData.email,
      password: hashedPassword,
      websiteUrl: companyData.websiteUrl,
      companyType: companyData.companyType,
      industry: companyData.industry,
      location: companyData.location,
      status: true
    },
  });

  return newCompany;
};



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
      location: jobData.location,
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

const getStudentJobsData = async (companyEmail, jobId) => {
  const companyHere = await prisma.companies.findFirst({
    where: { email: companyEmail }
  })
  const jobIdNumber = Number(jobId);
  const student = await prisma.jobs.findFirst({
    where: {
      companyId: companyHere.companyId,
      jobId: jobIdNumber
    },
    include: {
      Applications: {
        include: {
          student: {
            select: {
              student_id: true,
              studentName: true,
              email: true,
              phoneNumber: true,
              college: true,
              resume_link: true
            }
          }
        }
      }
    }
  });

  return student
}

const getAllCompanies = async (req, res) => {
  const companies = await prisma.companies.findMany({
    include: {
      _count: {
        select: { jobs: true }
      }
    }
  });
  return res.status(200).json(companies);
}
module.exports = { createCompanyifnotExists, existingCompany, createJobIfNotExists, updateCompany, getStudentJobsData, getAllCompanies };
