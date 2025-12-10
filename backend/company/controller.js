const { createCompanyifnotExists, existingCompany, updateCompany } = require('./services.js')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET


const postCompany = async (req, res) => {
  const companyData = req.body;
  try {
    const newCompany = await createCompanyifnotExists(companyData);
    const token = jwt.sign({ email: newCompany.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({ message: "signup successful", data: newCompany, token: token });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}


const companylogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existing = await existingCompany(email);
    const storedPassword = existing.password;
    const passwordMatch = await bcrypt.compare(password, storedPassword);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });

    }
    // if (existing.status === false) {
    //   return res.status(403).json({ error: 'Company account is not approved yet.' });
    // }
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      message: 'Login successful',
      token: token
    });

  }
  catch (error) {
    res.status(400).json({ error: error.message });
  }
}

const companydashboard = async (req, res) => {
  try {

    const loggedInEmail = req.companyEmail;
    const company = await existingCompany(loggedInEmail);


    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    return res.status(200).json({
      message: "Dashboard data fetched successfully",
      company: {
        id: company.companyId,
        name: company.companyName,
        email: company.email,
        industry: company.industry,
        location: company.location,
        website: company.website,
        companyType: company.companyType
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateCompanyProfile = async (req, res) => {
  try {
    const loggedInEmail = req.companyEmail;
    const { companyId, email, ...updateData } = req.body;

    const updatedCompany = await updateCompany(loggedInEmail, updateData);

    return res.status(200).json({
      message: "Company profile updated successfully",
      company: updatedCompany
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


module.exports = { postCompany, companylogin, companydashboard, updateCompanyProfile };